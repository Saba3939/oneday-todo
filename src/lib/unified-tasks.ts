// 認証状態に応じてSupabaseまたはlocalStorageを使い分ける統一インターフェース

import { Task } from './tasks';
import { LocalTask, getLocalTasks, getLocalTasksBeforeDate, addLocalTask, toggleLocalTask, updateLocalTask, deleteLocalTask, updateLocalTaskOrder, getAllLocalTasks } from './local-tasks';

// タスク管理クラス
export class TasksManager {
	private isAuthenticated: boolean;

	constructor(isAuthenticated: boolean) {
		this.isAuthenticated = isAuthenticated;
	}

	// タスク一覧取得
	async getTasks(): Promise<Task[]> {
		if (this.isAuthenticated) {
			// 認証済み: Supabaseから取得
			const { getTasks } = await import('./tasks');
			return await getTasks();
		} else {
			// ゲスト: ローカルストレージから取得
			const localTasks = await getLocalTasks();
			return this.convertLocalTasksToTasks(localTasks);
		}
	}

	// 指定日より前のタスク取得
	async getTasksBeforeDate(dateStr: string): Promise<Task[]> {
		if (this.isAuthenticated) {
			// 認証済み: Supabaseから取得
			const { getTasksBeforeDate } = await import('./tasks');
			return await getTasksBeforeDate(dateStr);
		} else {
			// ゲスト: ローカルストレージから取得
			const localTasks = await getLocalTasksBeforeDate(dateStr);
			return this.convertLocalTasksToTasks(localTasks);
		}
	}

	// タスク追加
	async addTask(content: string): Promise<Task> {
		if (this.isAuthenticated) {
			// 認証済み: Supabaseに追加
			const { addTask } = await import('./tasks');
			return await addTask(content);
		} else {
			// ゲスト: ローカルストレージに追加
			const localTask = await addLocalTask(content);
			return this.convertLocalTaskToTask(localTask);
		}
	}

	// タスクの完了状態トグル
	async toggleTask(id: number): Promise<void> {
		if (this.isAuthenticated) {
			// 認証済み: Supabaseで更新
			const { toggleTask } = await import('./tasks');
			return await toggleTask(id);
		} else {
			// ゲスト: ローカルストレージで更新
			return await toggleLocalTask(id);
		}
	}

	// タスク内容更新
	async updateTask(id: number, content: string): Promise<void> {
		if (this.isAuthenticated) {
			// 認証済み: Supabaseで更新
			const { updateTask } = await import('./tasks');
			return await updateTask(id, content);
		} else {
			// ゲスト: ローカルストレージで更新
			return await updateLocalTask(id, content);
		}
	}

	// タスク削除
	async deleteTask(id: number): Promise<void> {
		if (this.isAuthenticated) {
			// 認証済み: Supabaseから削除
			const { deleteTask } = await import('./tasks');
			return await deleteTask(id.toString());
		} else {
			// ゲスト: ローカルストレージから削除
			return await deleteLocalTask(id);
		}
	}

	// タスク順序更新
	async updateTaskOrder(taskIds: number[]): Promise<void> {
		if (this.isAuthenticated) {
			// 認証済み: Supabaseで順序更新
			const { updateTaskOrder } = await import('./tasks');
			return await updateTaskOrder(taskIds);
		} else {
			// ゲスト: ローカルストレージで順序更新
			return await updateLocalTaskOrder(taskIds);
		}
	}

	// 全タスク取得（同期用）
	async getAllTasks(): Promise<Task[]> {
		if (this.isAuthenticated) {
			// 認証済みでは通常のgetTasksと同じ
			return await this.getTasks();
		} else {
			// ゲスト: 全ローカルタスクを取得
			const allLocalTasks = await getAllLocalTasks();
			return this.convertLocalTasksToTasks(allLocalTasks);
		}
	}

	// LocalTask を Task に変換
	private convertLocalTaskToTask(localTask: LocalTask): Task {
		return {
			id: localTask.id,
			user_id: localTask.user_id,
			order_index: localTask.order_index,
			content: localTask.content,
			is_completed: localTask.is_completed,
			created_at: localTask.created_at,
		};
	}

	// LocalTask[] を Task[] に変換
	private convertLocalTasksToTasks(localTasks: LocalTask[]): Task[] {
		return localTasks.map(localTask => this.convertLocalTaskToTask(localTask));
	}
}

// ユーティリティ関数: 認証状態を確認してTasksManagerインスタンスを作成
export async function createTasksManager(): Promise<TasksManager> {
	// クライアントサイドでのみ使用
	if (typeof window !== 'undefined') {
		try {
			const { createClient } = await import('@/utils/supabase/client');
			const supabase = createClient();
			const { data: { user } } = await supabase.auth.getUser();
			return new TasksManager(!!user);
		} catch {
			return new TasksManager(false);
		}
	}
	
	// サーバーサイドでは常にゲストモードで初期化
	return new TasksManager(false);
}