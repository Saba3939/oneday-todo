"use server";

import { createClient } from "@/utils/supabase/server";

export interface Task {
	id: number;
	user_id: string;
	order_index: number;
	content: string;
	is_completed: boolean;
	created_at: string;
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
export async function addTask(content: string): Promise<Task> {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		throw new Error("ユーザー取得エラー:");
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
		.select("is_completed")
		.eq("id", taskId)
		.eq("user_id", user.id)
		.single();
	if (fetchError) {
		throw new Error("タスク取得エラー:");
	}
	const { error } = await supabase
		.from("tasks")
		.update({ is_completed: !currentTask?.is_completed })
		.eq("id", taskId)
		.eq("user_id", user.id)
		.select()
		.single();
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
		throw new Error("認証エラー");
	}

	const { error } = await supabase
		.from("tasks")
		.delete()
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) {
		console.error("タスク削除エラー:", error);
		throw new Error("タスクの削除に失敗しました");
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
