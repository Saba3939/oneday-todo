import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserPremiumStatus } from '@/lib/tasks';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // プレミアムステータスを取得
    const premiumStatus = await getUserPremiumStatus();
    
    return NextResponse.json({
      is_premium: premiumStatus?.is_premium || false,
      subscription_status: premiumStatus?.subscription_status,
      premium_expires_at: premiumStatus?.premium_expires_at
    });
  } catch (error) {
    console.error('プレミアムステータス取得エラー:', error);
    return NextResponse.json(
      { error: 'プレミアムステータスの取得に失敗しました' },
      { status: 500 }
    );
  }
}