import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getWeeklyStatistics, getMonthlyStatistics } from '@/lib/statistics';
import { getUserPremiumStatus } from '@/lib/tasks';
import { StatisticsChart, StatisticsSummary } from '@/components/StatisticsChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Crown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// Loading コンポーネント
function StatisticsLoading() {
  return (
    <div className="min-h-screen bg-white pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    </div>
  );
}

async function StatisticsContent() {
  const supabase = await createClient();
  
  // 認証確認
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // プレミアムステータス確認
  const premiumStatus = await getUserPremiumStatus();
  const isPremium = premiumStatus?.is_premium || false;

  // 統計データを取得
  const weeklyStats = await getWeeklyStatistics();
  
  // プレミアムユーザーの場合は月次データも取得
  let monthlyStats = null;
  if (isPremium) {
    try {
      monthlyStats = await getMonthlyStatistics(3); // 3ヶ月分
    } catch (error) {
      console.error('月次統計取得エラー:', error);
    }
  }

  return (
    <div className="min-h-screen bg-white pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-black flex items-center gap-2">
                  <TrendingUp className="w-8 h-8 text-black" />
                  統計
                </h1>
                <p className="text-gray-600 mt-1">
                  あなたのタスク管理の進捗を確認しましょう
                </p>
              </div>
            </div>

            {/* プレミアムステータス表示 */}
            {isPremium ? (
              <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                <Crown className="w-4 h-4" />
                プレミアム
              </div>
            ) : (
              <Link href="/premium/upgrade">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  プレミアムにアップグレード
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* 統計サマリー */}
        <StatisticsSummary 
          data={weeklyStats.days} 
          isPremium={isPremium}
        />

        {/* 無料プラン制限の説明 */}
        {!isPremium && (
          <Card className="mb-6 border-gray-200 bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Crown className="w-5 h-5 text-black mt-0.5" />
                </div>
                <div>
                  <h3 className="font-medium text-black mb-1">
                    無料プランの制限
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    無料プランでは過去7日間の統計のみ表示されます。
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>プレミアムプラン</strong>なら1年間の詳細統計、月次レポート、ダークモードが利用できます。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 週間統計チャート */}
        <div className="mb-8">
          <StatisticsChart
            data={weeklyStats.days}
            title="週間タスク統計"
            type="line"
            isPremium={isPremium}
          />
        </div>

        {/* プレミアム限定: 月次統計 */}
        {isPremium && monthlyStats && monthlyStats.length > 0 && (
          <div className="mb-8">
            <StatisticsChart
              data={monthlyStats}
              title="月次タスク統計（プレミアム限定）"
              type="bar"
              isPremium={true}
            />
          </div>
        )}

        {/* 統計詳細 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">週間サマリー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">総タスク数</span>
                  <span className="font-medium">{weeklyStats.total_tasks}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">完了タスク数</span>
                  <span className="font-medium text-black">{weeklyStats.completed_tasks}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均完了率</span>
                  <span className="font-medium text-black">{weeklyStats.average_completion_rate}%</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">1日平均タスク数</span>
                    <span className="font-medium">
                      {Math.round(weeklyStats.total_tasks / 7 * 10) / 10}件
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">アクティビティ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">アクティブ日数</span>
                  <span className="font-medium">
                    {weeklyStats.days.filter(day => day.total_tasks > 0).length}日
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最も生産的な日</span>
                  <span className="font-medium">
                    {weeklyStats.days.reduce((max, day) => 
                      day.completed_tasks > max.completed_tasks ? day : max
                    ).date.split('T')[0]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">完了率100%の日数</span>
                  <span className="font-medium text-black">
                    {weeklyStats.days.filter(day => 
                      day.total_tasks > 0 && day.completion_rate === 100
                    ).length}日
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function StatisticsPage() {
  return (
    <Suspense fallback={<StatisticsLoading />}>
      <StatisticsContent />
    </Suspense>
  );
}