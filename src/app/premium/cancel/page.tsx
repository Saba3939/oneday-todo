import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Home, Crown, ArrowRight } from 'lucide-react';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <Card className="shadow-xl">
          <CardHeader className="pb-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-gray-600 dark:text-gray-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              アップグレードをキャンセルしました
            </CardTitle>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              いつでもプレミアムプランに変更できます
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-amber-600" />
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  無料プランで継続利用
                </span>
              </div>
              
              <div className="text-left space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-amber-200 dark:border-amber-700">
                  <span className="text-sm text-gray-700 dark:text-gray-300">1日のタスク数</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">10個まで</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-amber-200 dark:border-amber-700">
                  <span className="text-sm text-gray-700 dark:text-gray-300">統計表示</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">7日間</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-amber-200 dark:border-amber-700">
                  <span className="text-sm text-gray-700 dark:text-gray-300">テーマ</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">ライトのみ</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">料金</span>
                  <span className="font-bold text-green-600">無料</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                プレミアムプランの特典
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                月300円で以下の機能が利用可能になります：
              </p>
              <div className="grid md:grid-cols-2 gap-2 text-left text-sm">
                <div className="text-gray-700 dark:text-gray-300">• 無制限のタスク作成</div>
                <div className="text-gray-700 dark:text-gray-300">• 1年間の詳細統計</div>
                <div className="text-gray-700 dark:text-gray-300">• ダークモード機能</div>
                <div className="text-gray-700 dark:text-gray-300">• 優先サポート</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  タスク管理を続ける
                </Button>
              </Link>
              
              <Link href="/premium/upgrade">
                <Button variant="outline" className="border-gray-200 text-black hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/50">
                  <Crown className="w-4 h-4 mr-2" />
                  プレミアムを検討する
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                プレミアムプランはいつでもアップグレード可能です
              </p>
              <Link href="/premium/upgrade" className="inline-flex items-center text-black dark:text-gray-300 hover:underline text-sm mt-1">
                詳細を確認する
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}