import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserPremiumStatus } from '@/lib/tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Crown, 
  Check, 
  ArrowLeft, 
  BarChart3, 
  Moon, 
  Infinity,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

async function UpgradePageContent() {
  const supabase = await createClient();
  
  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // プレミアムステータス確認
  const premiumStatus = await getUserPremiumStatus();
  const isPremium = premiumStatus?.is_premium || false;

  // すでにプレミアムユーザーの場合は管理画面にリダイレクト
  if (isPremium) {
    redirect('/premium/manage');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg mb-4">
              <Crown className="w-6 h-6" />
              プレミアムプラン
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              生産性を次のレベルへ
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              月300円で無制限のタスク管理と詳細統計を手に入れよう
            </p>
          </div>
        </div>

        {/* プラン比較 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* 無料プラン */}
          <Card className="border-gray-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">
                無料プラン
              </CardTitle>
              <div className="text-3xl font-bold text-gray-600 mt-2">
                ¥0
                <span className="text-lg font-normal text-gray-500">/月</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>1日10個までのタスク</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>7日間の統計表示</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>基本的なタスク管理</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>ライトテーマ</span>
                </li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full mt-6" 
                disabled
              >
                現在のプラン
              </Button>
            </CardContent>
          </Card>

          {/* プレミアムプラン */}
          <Card className="border-blue-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-blue-500 text-white px-4 py-1 text-sm font-medium">
              おすすめ
            </div>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-blue-900 flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                プレミアムプラン
              </CardTitle>
              <div className="text-4xl font-bold text-blue-600 mt-2">
                ¥300
                <span className="text-lg font-normal text-blue-500">/月</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">初月無料キャンペーン中！</p>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Infinity className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="font-medium">無制限のタスク作成</span>
                </li>
                <li className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="font-medium">1年間の詳細統計</span>
                </li>
                <li className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="font-medium">月次レポート機能</span>
                </li>
                <li className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="font-medium">ダークモード対応</span>
                </li>
                <li className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="font-medium">優先サポート</span>
                </li>
                <li className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="font-medium">データバックアップ</span>
                </li>
              </ul>
              
              <form action="/api/stripe/checkout" method="POST" className="mt-6">
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 text-lg shadow-lg"
                >
                  今すぐアップグレード
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* 詳細機能説明 */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            プレミアム機能の詳細
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Infinity className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">無制限のタスク</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  1日10個の制限を撤廃。大きなプロジェクトも細かくタスクに分けて管理できます。
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-lg">詳細統計</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  1年間のタスク履歴と統計で、生産性の向上パターンを詳しく分析できます。
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Moon className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg">ダークモード</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  目に優しいダークテーマで、夜間や暗い環境でも快適にタスク管理ができます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            よくある質問
          </h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">いつでも解約できますか？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  はい、いつでも解約可能です。解約後も次の請求日までは機能をご利用いただけます。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">データは安全ですか？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  全てのデータはSSL暗号化されており、Supabaseの安全なサーバーに保存されています。定期的なバックアップも実施しています。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">支払い方法は？</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Stripeを通じてクレジットカード（Visa、MasterCard、American Express等）でお支払いいただけます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-600">
            お困りの際は、
            <Link href="/support" className="text-blue-600 hover:underline">
              サポートページ
            </Link>
            までお気軽にお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <UpgradePageContent />
    </Suspense>
  );
}