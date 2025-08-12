import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserPremiumStatus } from '@/lib/tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Crown, 
  CheckCircle, 
  ArrowLeft, 
  Calendar, 
  CreditCard,
  Settings,
  Star,
  TrendingUp,
  Infinity,
  Moon
} from 'lucide-react';
import Link from 'next/link';

async function ManagePageContent() {
  const supabase = await createClient();
  
  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // プレミアムステータス確認
  const premiumStatus = await getUserPremiumStatus();
  const isPremium = premiumStatus?.is_premium || false;

  // プレミアムユーザーでない場合はアップグレード画面にリダイレクト
  if (!isPremium) {
    redirect('/premium/upgrade');
  }

  // プロフィール情報を取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const subscriptionStatus = premiumStatus?.subscription_status || 'active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/40 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg mb-4">
              <Crown className="w-6 h-6" />
              プレミアム会員
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              サブスクリプション管理
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              プレミアムプランをご利用いただき、ありがとうございます
            </p>
          </div>
        </div>

        {/* ステータスカード */}
        <Card className="mb-8 border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
                アクティブなプレミアムプラン
              </CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">¥300/月</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ステータス: <span className="font-medium text-green-600 capitalize">{subscriptionStatus}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">利用中の特典</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Infinity className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">無制限のタスク作成</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">1年間の詳細統計</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">ダークモード機能</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">優先サポート</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">アカウント情報</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">メールアドレス</span>
                    <span className="text-gray-900 dark:text-gray-100">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ユーザー名</span>
                    <span className="text-gray-900 dark:text-gray-100">{profile?.display_name || user.email?.split('@')[0]}</span>
                  </div>
                  {premiumStatus?.premium_expires_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">有効期限</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {new Date(premiumStatus.premium_expires_at).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* クイックアクション */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">統計を確認</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">詳細な分析を見る</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/statistics">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  統計画面へ
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">プロフィール</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">設定を変更</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/profile-setup">
                <Button variant="outline" className="w-full">
                  設定画面へ
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-gray-100">タスク管理</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">今日のタスクへ</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  タスク画面へ
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* サブスクリプション管理 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <CreditCard className="w-5 h-5" />
              サブスクリプション管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">お支払い方法</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    クレジットカードで毎月自動更新
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  変更
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">請求履歴</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    過去の請求書をダウンロード
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  表示
                </Button>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-400">サブスクリプションの解約</h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    いつでも解約可能です（次回請求日まで機能利用可能）
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  解約手続き
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* サポート */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100">サポート</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                プレミアムサポート
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ご質問やサポートが必要な際は、優先的に対応させていただきます。
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline">
                  よくある質問
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  サポートに連絡
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* フッター */}
        <div className="text-center py-8 mt-8">
          <p className="text-gray-600 dark:text-gray-400">
            OneDay Todo をご利用いただき、ありがとうございます。
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/40 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <ManagePageContent />
    </Suspense>
  );
}