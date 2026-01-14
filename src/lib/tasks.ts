"use server";

import { createClient } from "@/utils/supabase/server";


export interface Task {
	id: number;
	user_id: string;
	order_index: number;
	content: string;
	is_completed: boolean;
	created_at: string;
	completed_at?: string; // 統計機能用に追加
}

export async function getTasks(): Promise<Task[]> {
	const supabase = await createClient();

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		throw new Error("ユーザー取得エラー:");
	}
	const { data: tasks, error: tasksError } = await supabase
		.from("tasks")
		.select("*")
		.eq("user_id", user.id)
		.order("order_index", { ascending: true });
	if (tasksError) {
		throw new Error("タスク取得エラー:");
	}
	return tasks || [];
}
export async function addTask(content: string, targetDate?: string): Promise<Task> {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		throw new Error("ユーザー取得エラー:");
	}

	// プレミアム制限チェック
	const checkDate = targetDate || new Date().toISOString().split('T')[0];
	const { canAdd, reason } = await canAddTask(checkDate);
	
	if (!canAdd) {
		throw new Error(reason || 'タスクの追加が制限されています');
	}

	// 最大order_indexを取得するクエリを最適化
	const { data: maxOrder } = await supabase
		.from("tasks")
		.select("order_index")
		.eq("user_id", user.id)
		.order("order_index", { ascending: false })
		.limit(1)
		.single();

	// エラーが発生してもデフォルト値を使用（新規ユーザーの場合など）
	const newOrderIndex = (maxOrder?.order_index || 0) + 1;

	// タスクを追加（エラーハンドリングを改善）
	const { data, error } = await supabase
		.from("tasks")
		.insert({
			user_id: user.id,
			content,
			order_index: newOrderIndex,
			is_completed: false,
		})
		.select()
		.single();

	if (error) {
		console.error("タスク追加エラー:", error);
		throw new Error("タスク追加エラー:");
	}

	// 統計を更新（タスク作成数をカウント）
	try {
		await incrementDailyTaskCount(checkDate);
	} catch (statsError) {
		console.error('統計更新エラー:', statsError);
		// 統計の更新エラーはタスク作成を失敗させない
	}

	return data;
}

export async function toggleTask(taskId: number): Promise<void> {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		throw new Error("ユーザー取得エラー:");
	}
	const { data: currentTask, error: fetchError } = await supabase
		.from("tasks")
		.select("is_completed, created_at")
		.eq("id", taskId)
		.eq("user_id", user.id)
		.single();
	if (fetchError) {
		throw new Error("タスク取得エラー:");
	}
	
	const newIsCompleted = !currentTask?.is_completed;
	const updateData: { is_completed: boolean; completed_at?: string | null } = {
		is_completed: newIsCompleted,
	};
	
	// 完了時に completed_at を設定、未完了時はnullに
	if (newIsCompleted) {
		updateData.completed_at = new Date().toISOString();
	} else {
		updateData.completed_at = null;
	}
	
	const { error } = await supabase
		.from("tasks")
		.update(updateData)
		.eq("id", taskId)
		.eq("user_id", user.id)
		.select()
		.single();
	if (error) {
		console.error("タスク更新エラー:", error);
		throw new Error("タスク更新エラー:");
	}
	
	// 統計データを更新（非同期で実行、エラーは無視）
	if (currentTask?.created_at) {
		try {
			const taskDate = new Date(currentTask.created_at).toISOString().split('T')[0];
			await updateDailyTaskStatistics(taskDate);
		} catch (statsError) {
			console.warn("統計更新エラー:", statsError);
		}
	}
}
// タスクの内容を更新
export async function updateTask(taskId: number, content: string): Promise<void> {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		throw new Error("ユーザー取得エラー:");
	}
	
	const { error } = await supabase
		.from("tasks")
		.update({ content })
		.eq("id", taskId)
		.eq("user_id", user.id);
		
	if (error) {
		console.error("タスク更新エラー:", error);
		throw new Error("タスク更新エラー:");
	}
}

// タスクを削除
export async function deleteTask(id: string): Promise<void> {
	const supabase = await createClient();

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		throw new Error("ユーザー取得エラー:");
	}
	
	// 削除前にタスクの作成日を取得
	const { data: taskToDelete, error: fetchError } = await supabase
		.from("tasks")
		.select("created_at")
		.eq("id", id)
		.eq("user_id", user.id)
		.single();

	if (fetchError) {
		console.error("削除対象タスク取得エラー:", fetchError);
		throw new Error("削除対象タスク取得エラー:");
	}

	// Supabaseのtasksテーブルから物理削除
	const { error } = await supabase
		.from("tasks")
		.delete()
		.eq("id", id)
		.eq("user_id", user.id);
	if (error) {
		console.error("タスク削除エラー:", error);
		throw new Error("タスク削除エラー:");
	}

	// 統計を更新
	if (taskToDelete?.created_at) {
		try {
			const taskDate = new Date(taskToDelete.created_at).toISOString().split('T')[0];
			await updateDailyTaskStatistics(taskDate);
		} catch (statsError) {
			console.error('削除時統計更新エラー:', statsError);
			// 統計の更新エラーは削除を失敗させない
		}
	}
}

// タスクの順序を更新
export async function updateTaskOrder(taskIds: number[]): Promise<void> {
	const supabase = await createClient();

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		throw new Error("認証エラー");
	}

	// バッチ更新のためのデータを準備
	const updates = taskIds.map((id, index) => ({
		id: id,
		order_index: index + 1,
	}));

	// より安全な方法：各タスクを個別に更新
	for (const update of updates) {
		const { error } = await supabase
			.from("tasks")
			.update({ order_index: update.order_index })
			.eq("id", update.id)
			.eq("user_id", user.id); // ユーザーIDでフィルタリング

		if (error) {
			console.error("タスク順序更新エラー:", error);
			throw new Error("タスクの順序更新に失敗しました");
		}
	}
}

// または、より効率的な方法（トランザクションを使用）
export async function updateTaskOrderEfficient(
	taskIds: number[]
): Promise<void> {
	const supabase = await createClient();

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		throw new Error("認証エラー");
	}

	// まず、指定されたタスクがすべて現在のユーザーのものかを確認
	const { data: userTasks, error: fetchError } = await supabase
		.from("tasks")
		.select("id")
		.eq("user_id", user.id)
		.in("id", taskIds);

	if (fetchError) {
		console.error("タスク取得エラー:", fetchError);
		throw new Error("タスクの取得に失敗しました");
	}

	// ユーザーのタスク数と要求されたタスク数が一致するかチェック
	if (userTasks.length !== taskIds.length) {
		throw new Error("無効なタスクIDが含まれています");
	}

	// バッチ更新のためのデータを準備
	const updates = taskIds.map((id, index) => ({
		id: id,
		order_index: index + 1,
	}));

	// upsertを使用（ユーザーIDの確認は既に完了）
	const { error } = await supabase
		.from("tasks")
		.upsert(updates, { onConflict: "id" });

	if (error) {
		console.error("タスク順序更新エラー:", error);
		throw new Error("タスクの順序更新に失敗しました");
	}
}

/**
 * ユーザーのプレミアムステータスを取得
 */
export async function getUserPremiumStatus(): Promise<{is_premium: boolean; subscription_status?: string; premium_expires_at?: string} | null> {
	const supabase = await createClient();
	
	const { data: { user }, error: authError } = await supabase.auth.getUser();
	if (authError || !user) {
		return null;
	}

	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('is_premium, subscription_status, premium_expires_at')
		.eq('id', user.id)
		.single();

	if (profileError) {
		console.error('Premium status fetch error:', profileError);
		return { is_premium: false };
	}

	return {
		is_premium: profile?.is_premium || false,
		subscription_status: profile?.subscription_status,
		premium_expires_at: profile?.premium_expires_at,
	};
}

/**
 * タスク追加が可能かチェック（プレミアム制限考慮）
 */
export async function canAddTask(date: string): Promise<{ canAdd: boolean; reason?: string; currentCount?: number }> {
	const supabase = await createClient();
	
	// プレミアムステータス取得
	const premiumStatus = await getUserPremiumStatus();
	const isPremium = premiumStatus?.is_premium || false;
	
	// プレミアムユーザーは制限なし
	if (isPremium) {
		return { canAdd: true };
	}

	// 無料ユーザーの制限チェック
	const { data: { user }, error: authError } = await supabase.auth.getUser();
	if (authError || !user) {
		return { canAdd: false, reason: 'ユーザー認証エラー' };
	}

	// task_statisticsテーブルから該当日の作成済みタスク数を取得
	const { data: statistics, error: statsError } = await supabase
		.from('task_statistics')
		.select('total_tasks')
		.eq('user_id', user.id)
		.eq('date', date)
		.single();

	let currentCount = 0;

	if (statsError && statsError.code !== 'PGRST116') {
		console.error('Statistics fetch error:', statsError);
		// エラーが発生した場合は従来の方法でカウント
		const { data: tasks, error: tasksError } = await supabase
			.from('tasks')
			.select('id')
			.eq('user_id', user.id)
			.gte('created_at', `${date}T00:00:00`)
			.lt('created_at', `${date}T23:59:59`);

		if (tasksError) {
			console.error('Task count fetch error:', tasksError);
			return { canAdd: false, reason: 'タスク数の取得エラー' };
		}

		currentCount = tasks?.length || 0;
	} else {
		// 統計データがある場合はそれを使用、ない場合は0
		currentCount = statistics?.total_tasks || 0;
	}

	const maxTasks = 10; // 無料プランの制限

	if (currentCount >= maxTasks) {
		return { 
			canAdd: false, 
			reason: `無料プランでは1日${maxTasks}個までのタスクしか作成できません。プレミアムプランにアップグレードすると無制限になります。`,
			currentCount 
		};
	}

	return { canAdd: true, currentCount };
}

// 日次統計を更新するヘルパー関数
async function updateDailyTaskStatistics(date: string): Promise<void> {
	const supabase = await createClient();
	const { data: { user }, error: authError } = await supabase.auth.getUser();
	if (authError || !user) {
		throw new Error('ユーザー認証エラー');
	}

	// 該当日の現在のタスク状況を取得
	const { data: currentTasks, error: tasksError } = await supabase
		.from('tasks')
		.select('id, is_completed')
		.eq('user_id', user.id)
		.gte('created_at', `${date}T00:00:00`)
		.lt('created_at', `${date}T23:59:59`);

	if (tasksError) {
		console.error('Tasks fetch error for statistics:', tasksError);
		return;
	}

	const completedTasks = currentTasks?.filter(t => t.is_completed).length || 0;
	const totalCurrentTasks = currentTasks?.length || 0;

	// 既存の統計を取得
	const { data: existingStats } = await supabase
		.from('task_statistics')
		.select('total_tasks')
		.eq('user_id', user.id)
		.eq('date', date)
		.single();

	// total_tasksは削除されたタスクも含むため、現在のタスク数より少なくならないようにする
	const totalTasks = Math.max(existingStats?.total_tasks || 0, totalCurrentTasks);
	const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

	// 統計を更新または作成（UPSERT）
	const { error: upsertError } = await supabase
		.from('task_statistics')
		.upsert({
			user_id: user.id,
			date,
			total_tasks: totalTasks,
			completed_tasks: completedTasks,
			completion_rate: completionRate
		});

	if (upsertError) {
		console.error('Statistics upsert error:', upsertError);
	}
}

// タスク作成時に統計を更新するヘルパー関数
async function incrementDailyTaskCount(date: string): Promise<void> {
	const supabase = await createClient();
	const { data: { user }, error: authError } = await supabase.auth.getUser();
	if (authError || !user) {
		throw new Error('ユーザー認証エラー');
	}

	// 既存の統計を取得
	const { data: existingStats } = await supabase
		.from('task_statistics')
		.select('*')
		.eq('user_id', user.id)
		.eq('date', date)
		.single();

	if (existingStats) {
		// 既存のレコードがある場合はtotal_tasksを増やす
		const { error: updateError } = await supabase
			.from('task_statistics')
			.update({ 
				total_tasks: existingStats.total_tasks + 1,
				// completion_rateも再計算
				completion_rate: existingStats.total_tasks + 1 > 0 
					? (existingStats.completed_tasks / (existingStats.total_tasks + 1)) * 100 
					: 0
			})
			.eq('user_id', user.id)
			.eq('date', date);

		if (updateError) {
			console.error('Statistics update error:', updateError);
		}
	} else {
		// 新規レコードを作成
		const { error: insertError } = await supabase
			.from('task_statistics')
			.insert({
				user_id: user.id,
				date,
				total_tasks: 1,
				completed_tasks: 0,
				completion_rate: 0
			});

		if (insertError) {
			console.error('Statistics insert error:', insertError);
		}
	}
}

// 指定日（YYYY-MM-DD）のタスク一覧を取得
export async function getTasksByDate(date: string): Promise<Task[]> {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		throw new Error("ユーザー取得エラー:");
	}
	// created_atの日付部分が一致するタスクを取得
	const { data: tasks, error: tasksError } = await supabase
		.from("tasks")
		.select("*")
		.eq("user_id", user.id)
		.gte("created_at", `${date}T00:00:00+00:00`)
		.lt("created_at", `${date}T23:59:59+00:00`)
		.order("order_index", { ascending: true });
	if (tasksError) {
		throw new Error("タスク取得エラー:");
	}
	return tasks || [];
}

// 指定日（YYYY-MM-DD）より前の全タスクを取得
export async function getTasksBeforeDate(date: string): Promise<Task[]> {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		throw new Error("ユーザー取得エラー:");
	}
	// created_atが指定日より前のタスクを取得
	const { data: tasks, error: tasksError } = await supabase
		.from("tasks")
		.select("*")
		.eq("user_id", user.id)
		.lt("created_at", `${date}T00:00:00+00:00`)
		.order("order_index", { ascending: true });
	if (tasksError) {
		throw new Error("タスク取得エラー:");
	}
	return tasks || [];
}
