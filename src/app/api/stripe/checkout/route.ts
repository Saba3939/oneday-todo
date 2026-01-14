import { NextRequest, NextResponse } from 'next/server';
import { stripe, PREMIUM_PRICE_ID } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Stripeが利用できない場合のエラーハンドリング
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment functionality is not available' },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    
    // 認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // プロフィール情報を取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'プロフィール情報の取得に失敗しました' }, { status: 500 });
    }

    let customerId = profile?.stripe_customer_id;

    // Stripe顧客が存在しない場合は作成
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      
      customerId = customer.id;
      
      // データベースにStripe顧客IDを保存
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // 設定値の確認
    if (!PREMIUM_PRICE_ID) {
      console.error('STRIPE_PREMIUM_PRICE_ID is not set');
      return NextResponse.json(
        { error: 'STRIPE_PREMIUM_PRICE_IDが設定されていません' },
        { status: 500 }
      );
    }

    // Checkout Sessionを作成
    // 本番環境では詳細ログを制限
    if (process.env.NODE_ENV !== 'production') {
      console.log('🛒 Checkout Session作成中:', {
        customerId,
        userId: user.id,
        email: user.email,
        priceId: PREMIUM_PRICE_ID
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.nextUrl.origin}/premium/success`,
      cancel_url: `${req.nextUrl.origin}/premium/cancel`,
      metadata: {
        supabase_user_id: user.id,
      },
    });

    // 本番環境では機密情報をログに出力しない
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Checkout Session作成完了:', {
        sessionId: session.id,
        url: session.url,
        metadata: session.metadata
      });
    } else {
      console.log('✅ Checkout Session作成完了');
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation failed:', error);
    
    // Stripeエラーの詳細を含める
    let errorMessage = 'Checkout sessionの作成に失敗しました';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}