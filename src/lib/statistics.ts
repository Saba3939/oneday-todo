import { createClient } from '@/utils/supabase/server';
import { getUserPremiumStatus } from '@/lib/tasks';

export interface DailyStatistics {
  date: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

export interface WeeklyStatistics {
  days: DailyStatistics[];
  total_tasks: number;
  completed_tasks: number;
  average_completion_rate: number;
}

/**
 * 指定期間の統計データを取得
 */
export async function getStatistics(days: number = 7): Promise<DailyStatistics[]> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('認証が必要です');
  }

  // プレミアム制限チェック
  const premiumStatus = await getUserPremiumStatus();
  const isPremium = premiumStatus?.is_premium || false;
  const maxDays = isPremium ? 365 : 7; // プレミアムは1年、無料は1週間
  const limitedDays = Math.min(days, maxDays);

  // 指定期間の日付を計算（今日まで）
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999); // 今日の終わり
  
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - limitedDays + 1);
  startDate.setHours(0, 0, 0, 0); // 一日の始まり

  // task_statisticsテーブルから統計データを取得
  const { data: statistics, error: statsError } = await supabase
    .from('task_statistics')
    .select('date, total_tasks, completed_tasks, completion_rate')
    .eq('user_id', user.id)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (statsError) {
    console.error('統計データ取得エラー:', statsError);
    throw new Error('統計データの取得に失敗しました');
  }

  // 期間内の全ての日付を初期化
  const statisticsMap = new Map<string, DailyStatistics>();
  
  for (let i = 0; i < limitedDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    statisticsMap.set(dateStr, {
      date: dateStr,
      total_tasks: 0,
      completed_tasks: 0,
      completion_rate: 0,
    });
  }

  // 取得した統計データでマップを更新
  statistics?.forEach(stat => {
    statisticsMap.set(stat.date, {
      date: stat.date,
      total_tasks: stat.total_tasks || 0,
      completed_tasks: stat.completed_tasks || 0,
      completion_rate: stat.completion_rate || 0,
    });
  });

  return Array.from(statisticsMap.values()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * 週間統計データを取得
 */
export async function getWeeklyStatistics(): Promise<WeeklyStatistics> {
  const dailyStats = await getStatistics(7);
  
  const totalTasks = dailyStats.reduce((sum, day) => sum + day.total_tasks, 0);
  const totalCompleted = dailyStats.reduce((sum, day) => sum + day.completed_tasks, 0);
  const averageCompletionRate = totalTasks > 0 
    ? Math.round((totalCompleted / totalTasks) * 100)
    : 0;

  return {
    days: dailyStats,
    total_tasks: totalTasks,
    completed_tasks: totalCompleted,
    average_completion_rate: averageCompletionRate,
  };
}

/**
 * 月別統計データを取得（プレミアム限定）
 */
export async function getMonthlyStatistics(months: number = 12): Promise<DailyStatistics[]> {
  const premiumStatus = await getUserPremiumStatus();
  const isPremium = premiumStatus?.is_premium || false;
  if (!isPremium) {
    throw new Error('月別統計はプレミアムプランでのみ利用可能です');
  }

  const days = months * 30; // 概算
  return await getStatistics(days);
}

/**
 * 統計データを定期的に更新する関数
 * （タスク完了時に呼び出す）
 */
export async function updateTaskStatistics(date: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return;
  }

  // その日のタスク統計を再計算
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('is_completed')
    .eq('user_id', user.id)
    .gte('created_at', `${date}T00:00:00`)
    .lt('created_at', `${date}T23:59:59`);

  if (tasksError || !tasks) {
    console.error('タスク統計更新エラー:', tasksError);
    return;
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  // task_statistics テーブルを更新
  const { error: updateError } = await supabase
    .from('task_statistics')
    .upsert({
      user_id: user.id,
      date,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      completion_rate: completionRate,
    }, {
      onConflict: 'user_id, date'
    });

  if (updateError) {
    console.error('統計データ更新エラー:', updateError);
  }
}