import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServiceClient } from '@/utils/supabase/service';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  // Stripeが利用できない場合のエラーハンドリング
  if (!stripe) {
    return NextResponse.json(
      { error: 'Webhook functionality is not available' },
      { status: 503 }
    );
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!

  // 本番環境では基本情報のみログ出力
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔍 Webhook受信:', {
      hasBody: !!body,
      bodyLength: body.length,
      hasSignature: !!sig,
      timestamp: new Date().toISOString()
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    // 本番では簡潔なログのみ
    console.log(`✅ Webhook受信: ${event.type} - ${event.id}`);
  } catch (err) {
    console.error('❌ Webhook署名検証失敗:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Webhook用のSupabaseクライアント（サービスロール）
  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const supabaseUserId = session.metadata?.supabase_user_id;

        // 本番では機密情報をログに出力しない
        if (process.env.NODE_ENV !== 'production') {
          console.log(`🛒 決済完了: customer=${customerId}, user=${supabaseUserId}`);
        } else {
          console.log('🛒 決済完了処理開始');
        }

        if (supabaseUserId) {

          // プロファイルが存在するかチェックし、なければ作成
          const { data: existingProfile, error: selectError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', supabaseUserId)
            .single();

          if (selectError && selectError.code === 'PGRST116') {
            // プロファイルが存在しない場合は作成

            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: supabaseUserId,
                display_name: 'プレミアムユーザー',
                is_premium: true,
                subscription_status: 'active',
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                premium_expires_at: null
              });
            
            if (insertError) {
              console.error('❌ プロファイル作成エラー:', insertError);
            } else {
              console.log('✅ プレミアム登録完了');
            }
          } else if (!selectError && existingProfile) {
            // プレミアムステータスを更新

            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                subscription_status: 'active',
                is_premium: true,
                premium_expires_at: null
              })
              .eq('id', supabaseUserId);
              
            if (updateError) {
              console.error('❌ プロファイル更新エラー:', updateError);
            } else {
              console.log('✅ プレミアム更新完了');
            }
          } else {
            console.error('❌ プロファイル確認で予期しないエラー:', selectError);
          }
        } else {
          console.warn('⚠️ メタデータにユーザーIDなし、顧客IDから検索');
          
          // fallback: 顧客IDから既存プロファイルを検索
          const { data: profileByCustomer, error: customerError } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();
            
          if (!customerError && profileByCustomer) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                stripe_subscription_id: subscriptionId,
                subscription_status: 'active',
                is_premium: true,
                premium_expires_at: null
              })
              .eq('id', profileByCustomer.id);
              
            if (updateError) {
              console.error('❌ プロファイル更新エラー:', updateError);
            } else {
              console.log('✅ プレミアム更新完了（顧客ID検索）');
            }
          } else {
            console.error('❌ 顧客IDからプロファイルを見つけられません:', customerId);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // 顧客IDからSupabaseユーザーを検索
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          const isActive = subscription.status === 'active';
          await supabase
            .from('profiles')
            .update({
              subscription_status: subscription.status,
              is_premium: isActive,
              premium_expires_at: isActive ? null : 'current_period_end' in subscription ? new Date((subscription as { current_period_end: number }).current_period_end * 1000).toISOString() : new Date().toISOString(),
            })
            .eq('id', profile.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // 顧客IDからSupabaseユーザーを検索
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          // プレミアムステータスを無効化
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'canceled',
              is_premium: false,
              stripe_subscription_id: null,
              premium_expires_at: new Date().toISOString(),
            })
            .eq('id', profile.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // 顧客IDからSupabaseユーザーを検索
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          // 支払い失敗時の処理（猶予期間を設ける場合）
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'past_due',
            })
            .eq('id', profile.id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler failed:', error);
    return NextResponse.json(
      { error: 'Webhook処理に失敗しました' },
      { status: 500 }
    );
  }
}