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
 *
 * Logs name the Supabase user id only. They never include an email address.
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

/** Non-2xx so Stripe retries when the sync throws. Ignored events stay 200. */
export const SYNC_FAILURE_STATUS = 500;

/** Optional second signing secret for the other live Stripe webhook endpoint. */
export const STRIPE_WEBHOOK_SECRET_2_ENV = 'STRIPE_WEBHOOK_SECRET_2';

export const SUBSCRIPTION_SYNC_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.paused',
  'customer.subscription.resumed',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
];

export function isSubscriptionSyncEvent(eventType) {
  return SUBSCRIPTION_SYNC_EVENTS.includes(eventType);
}

/**
 * Try each configured signing secret. Does not log secrets or which one matched.
 * `constructEvent` throws when the signature does not match that secret.
 */
export function verifyAgainstSecrets(body, signature, secrets, constructEvent) {
  const candidates = [];
  for (const secret of secrets || []) {
    if (typeof secret === 'string' && secret.length > 0) candidates.push(secret);
  }
  if (!signature || candidates.length === 0) return { verified: false, event: null };
  for (const secret of candidates) {
    try {
      const event = constructEvent(body, signature, secret);
      if (event) return { verified: true, event };
    } catch {
      // Try the next configured secret.
    }
  }
  return { verified: false, event: null };
}

export function verificationLogLine(verified) {
  return verified ? 'Stripe webhook signature verified' : 'Stripe webhook signature not verified';
}

const PREMIUM_STATUSES = new Set(['active', 'trialing']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function subscriptionSyncHttpResponse(error) {
  if (!error) return { status: 200, body: { received: true } };
  console.error('Webhook processing failed');
  return { status: SYNC_FAILURE_STATUS, body: { error: 'Webhook processing failed' } };
}

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

function storedEventSeconds(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1e12 ? value / 1000 : value;
  }
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed / 1000 : null;
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

function logMatch(userId, how) {
  console.log('Matched Stripe subscription event to user', userId, 'via', how);
}

async function resolveCheckoutUser(session, deps) {
  const refId = session.client_reference_id;
  if (typeof refId === 'string' && UUID_RE.test(refId)) {
    const byId = await deps.findUserById(refId);
    if (byId) {
      logMatch(byId, 'client_reference_id');
      return byId;
    }
  }
  const customerId = customerIdOf(session.customer);
  if (customerId) {
    const byCustomer = await deps.findUserByCustomerId(customerId);
    if (byCustomer) {
      logMatch(byCustomer, 'stripe_customer_id');
      return byCustomer;
    }
  }
  const email = session.customer_details?.email ?? session.customer_email ?? null;
  if (email) {
    const byEmail = await deps.findUserByEmail(email);
    if (byEmail) {
      logMatch(byEmail, 'email_fallback');
      return byEmail;
    }
  }
  return null;
}

async function resolveSubscriptionUser(subscription, deps) {
  const customerId = customerIdOf(subscription.customer);
  if (customerId) {
    const byCustomer = await deps.findUserByCustomerId(customerId);
    if (byCustomer) {
      logMatch(byCustomer, 'stripe_customer_id');
      return byCustomer;
    }
  }
  if (subscription.id) {
    const bySubscription = await deps.findUserBySubscriptionId(subscription.id);
    if (bySubscription) {
      logMatch(bySubscription, 'stripe_subscription_id');
      return bySubscription;
    }
  }
  const metaId = subscription.metadata?.supabase_user_id;
  if (typeof metaId === 'string' && UUID_RE.test(metaId)) {
    const byMeta = await deps.findUserById(metaId);
    if (byMeta) {
      logMatch(byMeta, 'subscription_metadata');
      return byMeta;
    }
  }
  if (customerId && deps.customerEmail) {
    const email = await deps.customerEmail(customerId);
    if (email) {
      const byEmail = await deps.findUserByEmail(email);
      if (byEmail) {
        logMatch(byEmail, 'email_fallback');
        return byEmail;
      }
    }
  }
  return null;
}

async function finalize(event, deps, userId, incomingSubscriptionId, row) {
  const stored = deps.getStoredSubscription ? await deps.getStoredSubscription(userId) : null;
  if (stored) {
    if (
      incomingSubscriptionId &&
      stored.stripe_subscription_id &&
      incomingSubscriptionId !== stored.stripe_subscription_id &&
      (stored.status === 'active' || stored.status === 'trialing')
    ) {
      console.log(
        'Ignored other Stripe subscription',
        incomingSubscriptionId,
        'for user',
        userId,
        'keeping',
        stored.stripe_subscription_id,
      );
      return { op: 'ignore', reason: 'other subscription while a live subscription is stored' };
    }
    const storedSeconds = storedEventSeconds(stored.last_stripe_event_created);
    if (typeof event.created === 'number' && storedSeconds != null && event.created < storedSeconds) {
      console.log('Ignored stale Stripe event', event.created, 'for user', userId);
      return { op: 'ignore', reason: 'stale stripe event' };
    }
  }
  if (typeof event.created === 'number' && Number.isFinite(event.created)) {
    row.last_stripe_event_created = new Date(event.created * 1000).toISOString();
  }
  console.log('Applying Stripe subscription event', event.type, 'for user', userId, 'status', row.status);
  return { op: 'upsert', row };
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
    return finalize(event, deps, userId, subscription.id ?? subId, row);
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
    return finalize(event, deps, userId, object.id ?? null, row);
  }

  if (type === 'customer.subscription.deleted') {
    const userId = await resolveSubscriptionUser(object, deps);
    if (!userId) return { op: 'ignore', reason: 'deleted subscription user not mapped' };
    const row = rowFromSubscription({ ...object, status: 'canceled' }, userId);
    if (!row) return { op: 'ignore', reason: 'deleted subscription could not be stored' };
    return finalize(event, deps, userId, object.id ?? null, { ...row, subscription_type: 'free', status: 'canceled' });
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
      return finalize(event, deps, userId, subscription.id ?? subId, row);
    }
    if (type === 'invoice.payment_failed') {
      const userId = await deps.findUserBySubscriptionId(subId);
      if (!userId) return { op: 'ignore', reason: 'past_due user not mapped' };
      return finalize(event, deps, userId, subId, {
        user_id: userId,
        subscription_type: 'free',
        status: 'past_due',
        stripe_subscription_id: subId,
        stripe_customer_id: customerIdOf(object.customer),
      });
    }
    return { op: 'ignore', reason: 'paid invoice subscription could not be loaded' };
  }

  return { op: 'ignore', reason: `unhandled ${type}` };
}
