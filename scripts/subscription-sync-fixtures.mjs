import crypto from 'crypto';
import {
  planSubscriptionSync,
  subscriptionSyncHttpResponse,
  SYNC_FAILURE_STATUS,
  isSubscriptionSyncEvent,
  verificationLogLine,
  verifyAgainstSecrets,
} from '../supabase/functions/_shared/subscriptionSync.mjs';

const webhookSecret = 'fixture-webhook-secret';
const userId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function signEvent(event) {
  const body = JSON.stringify(event);
  const timestamp = event.created;
  const signature = crypto.createHmac('sha256', webhookSecret).update(`${timestamp}.${body}`).digest('hex');
  const header = `t=${timestamp},v1=${signature}`;
  const expected = crypto.createHmac('sha256', webhookSecret).update(`${timestamp}.${body}`).digest('hex');
  if (expected !== header.split('v1=')[1]) throw new Error('fixture signature did not verify');
  return JSON.parse(body);
}

function storedRow() {
  return {
    stripe_subscription_id: 'sub_new',
    status: 'active',
    last_stripe_event_created: new Date(2000 * 1000).toISOString(),
  };
}

function deps(stored) {
  return {
    getSubscription: async (id) => ({
      id,
      status: 'active',
      customer: 'cus_new',
      current_period_start: 1794270000,
      current_period_end: 1794874800,
    }),
    findUserById: async () => userId,
    findUserByCustomerId: async () => userId,
    findUserBySubscriptionId: async () => userId,
    findUserByEmail: async () => {
      throw new Error('email fallback must not run for these fixtures');
    },
    customerEmail: async () => null,
    getStoredSubscription: async () => stored,
  };
}

const pausedOld = signEvent({
  id: 'evt_old_paused',
  type: 'customer.subscription.paused',
  created: 3000,
  data: {
    object: {
      id: 'sub_old',
      status: 'paused',
      customer: 'cus_old',
      current_period_start: 1794000000,
      current_period_end: 1794600000,
    },
  },
});

const deletedOld = signEvent({
  id: 'evt_old_deleted',
  type: 'customer.subscription.deleted',
  created: 3001,
  data: {
    object: {
      id: 'sub_old',
      status: 'canceled',
      customer: 'cus_old',
      current_period_start: 1794000000,
      current_period_end: 1794600000,
    },
  },
});

const staleUpdate = signEvent({
  id: 'evt_stale',
  type: 'customer.subscription.updated',
  created: 1000,
  data: {
    object: {
      id: 'sub_new',
      status: 'paused',
      customer: 'cus_new',
      current_period_start: 1794270000,
      current_period_end: 1794874800,
    },
  },
});

const before = storedRow();
for (const event of [pausedOld, deletedOld]) {
  const plan = await planSubscriptionSync(event, deps(before));
  assert(plan.op === 'ignore', `${event.type} for the old subscription was applied: ${plan.reason}`);
  assert(
    plan.reason === 'other subscription while a live subscription is stored',
    `unexpected reason ${plan.reason}`,
  );
}
assert(before.status === 'active', 'stored status changed');
assert(before.stripe_subscription_id === 'sub_new', 'stored subscription id changed');
console.log('old paused and deleted events ignored while sub_new is active');

const stale = await planSubscriptionSync(staleUpdate, deps(before));
assert(stale.op === 'ignore', `stale event was applied: ${stale.reason}`);
assert(stale.reason === 'stale stripe event', stale.reason);
assert(before.last_stripe_event_created === new Date(2000 * 1000).toISOString(), 'watermark changed');
console.log('older event created at 1000 skipped; watermark stayed at 2000');

const failure = subscriptionSyncHttpResponse(new Error('upsert failed'));
assert(failure.status === SYNC_FAILURE_STATUS, `failure status ${failure.status}`);
assert(failure.status >= 400 && failure.status < 600 && failure.status !== 200, 'failure status is 2xx');
const success = subscriptionSyncHttpResponse(null);
assert(success.status === 200, `success status ${success.status}`);

async function applyThatThrows() {
  throw new Error('database write failed');
}
let thrownStatus = 200;
try {
  await applyThatThrows();
} catch (error) {
  thrownStatus = subscriptionSyncHttpResponse(error).status;
}
assert(thrownStatus === 500, `throw status ${thrownStatus}`);
console.log('apply throw returns HTTP', thrownStatus);

const primarySecret = 'whsec_fixture_primary_endpoint';
const secondSecret = 'whsec_fixture_second_endpoint';

function stripeSign(payload, secret) {
  const body = JSON.stringify(payload);
  const timestamp = payload.created;
  const digest = crypto.createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
  return { body, header: `t=${timestamp},v1=${digest}` };
}

function constructEvent(payload, header, secret) {
  const timestamp = header.match(/t=(\d+)/)?.[1];
  const given = header.match(/v1=([a-f0-9]+)/)?.[1];
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex');
  if (!timestamp || !given || given !== expected) throw new Error('signature mismatch');
  return JSON.parse(payload);
}

const pausedForWebhook = {
  id: 'evt_webhook_paused',
  type: 'customer.subscription.paused',
  created: 4000,
  data: {
    object: {
      id: 'sub_old',
      status: 'paused',
      customer: 'cus_old',
      current_period_start: 1794000000,
      current_period_end: 1794600000,
    },
  },
};
const signedBySecond = stripeSign(pausedForWebhook, secondSecret);
const matchedSecond = verifyAgainstSecrets(
  signedBySecond.body,
  signedBySecond.header,
  [primarySecret, secondSecret],
  constructEvent,
);
assert(matchedSecond.verified === true, 'second signing secret was not accepted');
assert(matchedSecond.event.type === 'customer.subscription.paused', 'paused event was not parsed');

const unmatched = verifyAgainstSecrets(
  signedBySecond.body,
  signedBySecond.header,
  [primarySecret],
  constructEvent,
);
assert(unmatched.verified === false, 'wrong secret was accepted');

const logs = [];
const originalLog = console.log;
console.log = (...parts) => logs.push(parts.join(' '));
try {
  console.log(verificationLogLine(matchedSecond.verified));
  console.log(verificationLogLine(unmatched.verified));
} finally {
  console.log = originalLog;
}
assert(logs.includes('Stripe webhook signature verified'), 'missing verified log');
assert(logs.includes('Stripe webhook signature not verified'), 'missing not-verified log');
const secretLeak = logs.some((line) => line.includes(primarySecret) || line.includes(secondSecret));
assert(!secretLeak, 'verification log included a secret');
console.log('stripe-webhook accepted either signing secret and logged only verified or not verified');

assert(isSubscriptionSyncEvent('checkout.session.completed'), 'checkout should sync the subscription');
assert(isSubscriptionSyncEvent('customer.subscription.paused'), 'paused should sync');
assert(isSubscriptionSyncEvent('invoice.paid'), 'invoice.paid should sync');
assert(isSubscriptionSyncEvent('invoice.payment_failed'), 'invoice.payment_failed should sync');
assert(!isSubscriptionSyncEvent('payment_intent.succeeded'), 'payment intents stay on the payments path');

const webhookPlan = await planSubscriptionSync(matchedSecond.event, deps(before));
assert(webhookPlan.op === 'ignore', `stripe-webhook would have applied the old paused sub: ${webhookPlan.reason}`);
console.log('stripe-webhook subscription event uses the shared sync and ignored the other subscription');

let webhookStatus = 200;
try {
  await applyThatThrows();
} catch (error) {
  webhookStatus = subscriptionSyncHttpResponse(error).status;
}
assert(webhookStatus === 500, `stripe-webhook throw status ${webhookStatus}`);
console.log('stripe-webhook throw returns HTTP', webhookStatus);

console.log('ALL_SUBSCRIPTION_GUARD_FIXTURES_PASSED');
