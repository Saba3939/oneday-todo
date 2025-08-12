// ローカルストレージ用のタスク管理ライブラリ

export interface LocalTask {
	id: number;
	user_id: string;
	order_index: number;
	content: string;
	is_completed: boolean;
	created_at: string;
}

const STORAGE_KEY = 'oneday-todo-tasks';
const LAST_ACCESS_KEY = 'oneday-todo-last-access';

// 日本時間での日付文字列を取得
function toJstDateString(date: Date): string {
	const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
	return jstDate.toISOString().split('T')[0];
}

// ローカルストレージからタスクデータを取得
function getStorageData(): LocalTask[] {
	if (typeof window === 'undefined') return [];
	
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		if (!data) return [];
		
		const parsedData = JSON.parse(data);
		return Array.isArray(parsedData) ? parsedData : [];
	} catch (error) {
		console.error('ローカルストレージからのデータ取得エラー:', error);
		return [];
	}
}

// ローカルストレージにタスクデータを保存
function setStorageData(tasks: LocalTask[]): void {
	if (typeof window === 'undefined') return;
	
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
	} catch (error) {
		console.error('ローカルストレージへのデータ保存エラー:', error);
	}
}

// 今日の日付のタスクのみを取得
export function getLocalTasks(): Promise<LocalTask[]> {
	return new Promise((resolve) => {
		const allTasks = getStorageData();
		const today = toJstDateString(new Date());
		
		// 今日作成されたタスクのみをフィルタ
		const todayTasks = allTasks.filter(task => {
			const taskDate = toJstDateString(new Date(task.created_at));
			return taskDate === today;
		});
		
		// order_indexでソート
		todayTasks.sort((a, b) => a.order_index - b.order_index);
		
		resolve(todayTasks);
	});
}

// 指定した日付より前のタスクを取得
export function getLocalTasksBeforeDate(dateStr: string): Promise<LocalTask[]> {
	return new Promise((resolve) => {
		const allTasks = getStorageData();
		
		const beforeTasks = allTasks.filter(task => {
			const taskDate = toJstDateString(new Date(task.created_at));
			return taskDate < dateStr;
		});
		
		resolve(beforeTasks);
	});
}

// 新しいタスクを追加
export function addLocalTask(content: string): Promise<LocalTask> {
	return new Promise((resolve) => {
		const allTasks = getStorageData();
		
		// 新しいタスクのorder_indexを計算（今日のタスクの最大値 + 1）
		const today = toJstDateString(new Date());
		const todayTasks = allTasks.filter(task => {
			const taskDate = toJstDateString(new Date(task.created_at));
			return taskDate === today;
		});
		
		const maxOrderIndex = todayTasks.length > 0 
			? Math.max(...todayTasks.map(t => t.order_index))
			: 0;
		
		const newTask: LocalTask = {
			id: Date.now() + Math.floor(Math.random() * 1000), // ユニークIDを生成
			user_id: 'guest',
			order_index: maxOrderIndex + 1,
			content,
			is_completed: false,
			created_at: new Date().toISOString(),
		};
		
		allTasks.push(newTask);
		setStorageData(allTasks);
		
		resolve(newTask);
	});
}

// タスクの完了状態をトグル
export function toggleLocalTask(id: number): Promise<void> {
	return new Promise((resolve) => {
		const allTasks = getStorageData();
		const taskIndex = allTasks.findIndex(task => task.id === id);
		
		if (taskIndex !== -1) {
			allTasks[taskIndex].is_completed = !allTasks[taskIndex].is_completed;
			setStorageData(allTasks);
		}
		
		resolve();
	});
}

// タスクの内容を更新
export function updateLocalTask(id: number, content: string): Promise<void> {
	return new Promise((resolve) => {
		const allTasks = getStorageData();
		const taskIndex = allTasks.findIndex(task => task.id === id);
		
		if (taskIndex !== -1) {
			allTasks[taskIndex].content = content;
			setStorageData(allTasks);
		}
		
		resolve();
	});
}

// タスクを削除
export function deleteLocalTask(id: number): Promise<void> {
	return new Promise((resolve) => {
		const allTasks = getStorageData();
		const filteredTasks = allTasks.filter(task => task.id !== id);
		setStorageData(filteredTasks);
		resolve();
	});
}

// タスクの順序を更新
export function updateLocalTaskOrder(taskIds: number[]): Promise<void> {
	return new Promise((resolve) => {
		const allTasks = getStorageData();
		const today = toJstDateString(new Date());
		
		// 今日のタスクのみを対象に順序を更新
		taskIds.forEach((id, index) => {
			const taskIndex = allTasks.findIndex(task => task.id === id);
			if (taskIndex !== -1) {
				const taskDate = toJstDateString(new Date(allTasks[taskIndex].created_at));
				if (taskDate === today) {
					allTasks[taskIndex].order_index = index + 1;
				}
			}
		});
		
		setStorageData(allTasks);
		resolve();
	});
}

// 全ローカルタスクを取得（同期用）
export function getAllLocalTasks(): Promise<LocalTask[]> {
	return new Promise((resolve) => {
		const allTasks = getStorageData();
		resolve(allTasks);
	});
}

// 全ローカルタスクをクリア（同期後のクリーンアップ用）
export function clearAllLocalTasks(): Promise<void> {
	return new Promise((resolve) => {
		if (typeof window !== 'undefined') {
			localStorage.removeItem(STORAGE_KEY);
		}
		resolve();
	});
}

// ゲストモード用の最終アクセス日を取得
export function getLastAccessDate(): string | null {
	if (typeof window === 'undefined') return null;
	
	try {
		return localStorage.getItem(LAST_ACCESS_KEY);
	} catch (error) {
		console.error('最終アクセス日取得エラー:', error);
		return null;
	}
}

// ゲストモード用の最終アクセス日を更新
export function updateLastAccessDate(): Promise<void> {
	return new Promise((resolve) => {
		if (typeof window === 'undefined') return resolve();
		
		try {
			const today = toJstDateString(new Date());
			localStorage.setItem(LAST_ACCESS_KEY, today);
		} catch (error) {
			console.error('最終アクセス日更新エラー:', error);
		}
		resolve();
	});
}