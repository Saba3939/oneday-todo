import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Crown, Home, TrendingUp } from 'lucide-react';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/40 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-xl">
          <CardHeader className="pb-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              プレミアムプランへようこそ！
            </CardTitle>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              アップグレードが完了しました
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-yellow-500" />
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  プレミアム特典が利用可能になりました
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">無制限のタスク作成</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">1年間の詳細統計</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">ダークモード機能</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">優先サポート</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="mb-2">
                <strong>🎉 特別キャンペーン適用中</strong>
              </p>
              <p>
                初月は無料でご利用いただけます。次回請求は1ヶ月後となります。
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  タスク管理を始める
                </Button>
              </Link>
              
              <Link href="/statistics">
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  統計を確認する
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                プレミアムプランの管理は
                <Link href="/premium/manage" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                  こちら
                </Link>
                から行えます
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}