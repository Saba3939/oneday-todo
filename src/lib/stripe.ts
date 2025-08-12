import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-07-30.basil',
});

// 製品とプライスID（実際のStripe Dashboard値に置き換える必要あり）
export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || '';

export const PREMIUM_PLAN_FEATURES = {
  unlimited_tasks: true,
  yearly_statistics: true,
  dark_mode: true,
};

export const FREE_PLAN_LIMITS = {
  max_daily_tasks: 10,
  statistics_days: 7,
};