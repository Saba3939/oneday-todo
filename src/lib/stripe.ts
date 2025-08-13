import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// 開発環境以外では環境変数が必要
if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_SECRET_KEY environment variable is required in production');
}

// Stripe インスタンスは環境変数がある場合のみ作成
export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-07-30.basil',
}) : null;

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