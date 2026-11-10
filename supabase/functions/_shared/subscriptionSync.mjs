/**
 * Maps Stripe subscription events onto user_subscriptions.
 * Premium is only Stripe status active or trialing. Every other stored
 * status is free and subject to the 5-property cap.
 *
 * User mapping, in order:
 * 1. Checkout client_reference_id (Supabase user id on the payment-link URL)
 * 2. stripe_customer_id already stored for that customer
 * 3. stripe_subscription_id already stored
 * 4. email on public.users, only when the stronger ids are missing
 */

export const STRIPE_SUBSCRIPTION_STATUSES = [
  'active',
  'trialing',
  'canceled',
  'past_due',
  'incomplete',
  'incomplete_expired',
  'unpaid',
  'paused',
];

const PREMIUM_STATUSES = new Set(['active', 'trialing']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function customerIdOf(customer) {
  if (!customer) return null;
  return typeof customer === 'string' ? customer : customer.id ?? null;
}

export function subscriptionIdOf(subscription) {
  if (!subscription) return null;
  return typeof subscription === 'string' ? subscription : subscription.id ?? null;
}

export function entitlementForStatus(status) {
  if (!STRIPE_SUBSCRIPTION_STATUSES.includes(status)) return null;
  return {
    subscription_type: PREMIUM_STATUSES.has(status) ? 'premium' : 'free',
    status,
  };
}

function periodIso(unixSeconds) {
  if (typeof unixSeconds !== 'number' || !Number.isFinite(unixSeconds)) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

function rowFromSubscription(subscription, userId) {
  const entitlement = entitlementForStatus(subscription?.status);
  if (!entitlement || !userId) return null;
  const row = {
    user_id: userId,
    subscription_type: entitlement.subscription_type,
    status: entitlement.status,
    stripe_subscription_id: subscription.id ?? null,
    stripe_customer_id: customerIdOf(subscription.customer),
  };
  const start = periodIso(subscription.current_period_start);
  const end = periodIso(subscription.current_period_end);
  if (start) row.current_period_start = start;
  if (end) row.current_period_end = end;
  return row;
}

async function resolveCheckoutUser(session, deps) {
  const refId = session.client_reference_id;
  if (typeof refId === 'string' && UUID_RE.test(refId)) {
    const byId = await deps.findUserById(refId);
    if (byId) return byId;
  }
  const customerId = customerIdOf(session.customer);
  if (customerId) {
    const byCustomer = await deps.findUserByCustomerId(customerId);
    if (byCustomer) return byCustomer;
  }
  const email = session.customer_details?.email ?? session.customer_email ?? null;
  if (email) {
    const byEmail = await deps.findUserByEmail(email);
    if (byEmail) return byEmail;
  }
  return null;
}

async function resolveSubscriptionUser(subscription, deps) {
  const customerId = customerIdOf(subscription.customer);
  if (customerId) {
    const byCustomer = await deps.findUserByCustomerId(customerId);
    if (byCustomer) return byCustomer;
  }
  if (subscription.id) {
    const bySubscription = await deps.findUserBySubscriptionId(subscription.id);
    if (bySubscription) return bySubscription;
  }
  const metaId = subscription.metadata?.supabase_user_id;
  if (typeof metaId === 'string' && UUID_RE.test(metaId)) {
    const byMeta = await deps.findUserById(metaId);
    if (byMeta) return byMeta;
  }
  if (customerId && deps.customerEmail) {
    const email = await deps.customerEmail(customerId);
    if (email) {
      const byEmail = await deps.findUserByEmail(email);
      if (byEmail) return byEmail;
    }
  }
  return null;
}

/**
 * @returns {Promise<{op:'upsert', row:object} | {op:'ignore', reason:string}>}
 */
export async function planSubscriptionSync(event, deps) {
  const type = event?.type;
  const object = event?.data?.object;
  if (!type || !object) return { op: 'ignore', reason: 'missing event' };

  if (type === 'checkout.session.completed') {
    if (object.mode !== 'subscription') return { op: 'ignore', reason: 'checkout is not a subscription' };
    const subId = subscriptionIdOf(object.subscription);
    if (!subId) return { op: 'ignore', reason: 'checkout has no subscription' };
    const subscription = await deps.getSubscription(subId);
    if (!subscription) return { op: 'ignore', reason: 'subscription could not be loaded' };
    const userId = await resolveCheckoutUser(object, deps);
    if (!userId) return { op: 'ignore', reason: 'checkout user not mapped' };
    const row = rowFromSubscription(subscription, userId);
    if (!row) return { op: 'ignore', reason: `unsupported status ${subscription.status}` };
    return { op: 'upsert', row };
  }

  if (
    type === 'customer.subscription.created' ||
    type === 'customer.subscription.updated' ||
    type === 'customer.subscription.paused' ||
    type === 'customer.subscription.resumed'
  ) {
    const userId = await resolveSubscriptionUser(object, deps);
    if (!userId) return { op: 'ignore', reason: 'subscription user not mapped' };
    const row = rowFromSubscription(object, userId);
    if (!row) return { op: 'ignore', reason: `unsupported status ${object.status}` };
    return { op: 'upsert', row };
  }

  if (type === 'customer.subscription.deleted') {
    const userId = await resolveSubscriptionUser(object, deps);
    if (!userId) return { op: 'ignore', reason: 'deleted subscription user not mapped' };
    const row = rowFromSubscription({ ...object, status: 'canceled' }, userId);
    if (!row) return { op: 'ignore', reason: 'deleted subscription could not be stored' };
    return { op: 'upsert', row: { ...row, subscription_type: 'free', status: 'canceled' } };
  }

  if (type === 'invoice.paid' || type === 'invoice.payment_failed') {
    const subId = subscriptionIdOf(object.subscription);
    if (!subId) return { op: 'ignore', reason: 'invoice has no subscription' };
    const subscription = await deps.getSubscription(subId);
    if (subscription) {
      const userId = await resolveSubscriptionUser(subscription, deps);
      if (!userId) return { op: 'ignore', reason: 'invoice user not mapped' };
      const row = rowFromSubscription(subscription, userId);
      if (!row) return { op: 'ignore', reason: `unsupported status ${subscription.status}` };
      return { op: 'upsert', row };
    }
    if (type === 'invoice.payment_failed') {
      const userId = await deps.findUserBySubscriptionId(subId);
      if (!userId) return { op: 'ignore', reason: 'past_due user not mapped' };
      return {
        op: 'upsert',
        row: {
          user_id: userId,
          subscription_type: 'free',
          status: 'past_due',
          stripe_subscription_id: subId,
          stripe_customer_id: customerIdOf(object.customer),
        },
      };
    }
    return { op: 'ignore', reason: 'paid invoice subscription could not be loaded' };
  }

  return { op: 'ignore', reason: `unhandled ${type}` };
}
