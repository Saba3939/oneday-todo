"use client";

import { TasksManager } from "@/lib/unified-tasks";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	GripVertical,
	Trash2,
	Plus,
	User,
	LogOut,
} from "lucide-react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSensors, useSensor, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Task {
	id: number;
	user_id: string;
	order_index: number;
	content: string;
	is_completed: boolean;
	created_at: string;
}

interface UserProfile {
	id: string;
	email: string;
	username: string;
	displayName: string;
	avatarUrl: string;
}

interface TodoAppProps {
	user?: UserProfile; // オプショナルに変更
	lastLoginAt?: string;
	isGuest?: boolean; // ゲストモードフラグを追加
}

// ソート可能なタスクアイテムコンポーネント
function SortableTaskItem({
	task,
	onToggle,
	onDelete,
	isToggling,
	taskIndex,
	isFocused,
	onFocus,
	isEditing,
	editingContent,
	onStartEdit,
	onCancelEdit,
	onSaveEdit,
	onEditingContentChange,
	bulkSelectMode,
	isSelected,
	onToggleSelection,
}: {
	task: Task;
	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
	isToggling: boolean;
	taskIndex: number;
	isFocused: boolean;
	onFocus: (index: number) => void;
	isEditing: boolean;
	editingContent: string;
	onStartEdit: (taskId: number, content: string) => void;
	onCancelEdit: () => void;
	onSaveEdit: () => void;
	onEditingContentChange: (content: string) => void;
	bulkSelectMode: boolean;
	isSelected: boolean;
	onToggleSelection: (taskId: number) => void;
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: task.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 50 : "auto",
	};

	return (
		<Card
			ref={setNodeRef}
			style={style}
			role="listitem"
			aria-label={`タスク: ${task.content}${task.is_completed ? ' (完了済み)' : ' (未完了)'}`}
			tabIndex={isFocused ? 0 : -1}
			onFocus={() => onFocus(taskIndex)}
			className={`group relative border border-gray-300/60 bg-white/90 backdrop-blur-sm hover:bg-white hover:border-gray-400/70 rounded-xl shadow-sm hover:shadow-lg ${
				task.is_completed 
					? "opacity-75 bg-gray-100/80 hover:bg-gray-100" 
					: ""
			} ${isDragging ? "rotate-2 shadow-xl" : ""} ${isFocused ? "ring-2 ring-blue-500 ring-opacity-50" : ""}`}
		>
			{/* 完了したタスクの装飾ライン */}
			{task.is_completed && (
				<div className="absolute inset-0 bg-gradient-to-r from-gray-100/30 via-gray-50/40 to-gray-100/30 rounded-xl" />
			)}
			
			<CardContent className='relative px-4 sm:px-5'>
				<div className='flex items-center gap-3 sm:gap-4'>
					{/* 一括選択用チェックボックス */}
					{bulkSelectMode && (
						<Checkbox
							checked={isSelected}
							onCheckedChange={() => onToggleSelection(task.id)}
							className="w-5 h-5 border-2 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
							aria-label={`タスク「${task.content}」を選択`}
						/>
					)}

					{/* Drag Handle */}
					<button
						{...attributes}
						{...listeners}
						className='cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100/60 focus:ring-2 focus:ring-blue-500 focus:outline-none'
						title='ドラッグして並び替え'
						aria-label={`タスク「${task.content}」をドラッグして並び替え`}
						tabIndex={0}
					>
						<GripVertical className='w-4 h-4 sm:w-5 sm:h-5' />
					</button>

					{/* Checkbox */}
					<div className='relative'>
						<Checkbox
							id={task.id.toString()}
							checked={task.is_completed}
							onCheckedChange={() => onToggle(task.id.toString())}
							className='w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-400 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 data-[state=checked]:shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none'
							aria-describedby={`task-content-${task.id}`}
						/>
						{/* チェック時のリングエフェクト */}
						{task.is_completed && (
							<div className="absolute inset-0 rounded-md bg-gray-400/20" />
						)}
					</div>

					{/* Task text */}
					{isEditing ? (
						<div className="flex-1 flex items-center gap-2">
							<Input
								value={editingContent}
								onChange={(e) => onEditingContentChange(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										onSaveEdit();
									} else if (e.key === 'Escape') {
										e.preventDefault();
										onCancelEdit();
									}
								}}
								onBlur={onSaveEdit}
								autoFocus
								className="text-base sm:text-lg font-normal leading-relaxed bg-white border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								aria-label="タスク内容を編集"
							/>
							<div className="flex gap-1">
								<button
									onClick={onSaveEdit}
									className="text-green-600 hover:text-green-800 p-1 rounded focus:ring-2 focus:ring-green-500 focus:outline-none"
									title="保存"
									aria-label="編集を保存"
								>
									✓
								</button>
								<button
									onClick={onCancelEdit}
									className="text-red-600 hover:text-red-800 p-1 rounded focus:ring-2 focus:ring-red-500 focus:outline-none"
									title="キャンセル"
									aria-label="編集をキャンセル"
								>
									✕
								</button>
							</div>
						</div>
					) : (
						<label
							htmlFor={task.id.toString()}
							id={`task-content-${task.id}`}
							className={`flex-1 text-base sm:text-lg cursor-pointer font-normal leading-relaxed ${
								task.is_completed
									? "line-through text-gray-500 decoration-2 decoration-gray-600/60"
									: "text-gray-900 hover:text-gray-700"
							} ${isToggling ? "opacity-50 scale-95" : ""}`}
							onDoubleClick={() => onStartEdit(task.id, task.content)}
							title="ダブルクリックで編集"
						>
							{task.content}
						</label>
					)}

					{/* Delete button - スマホでは常に表示、デスクトップではホバーで表示 */}
					<div className='sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-x-2 sm:group-hover:translate-x-0'>
						<Button
							variant='ghost'
							size='sm'
							className='h-8 w-8 sm:h-9 sm:w-9 p-0 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none'
							onClick={() => onDelete(task.id.toString())}
							title='タスクを削除'
							aria-label={`タスク「${task.content}」を削除`}
						>
							<Trash2 className='w-4 h-4 sm:w-4 sm:h-4' />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// JST日付文字列に変換する関数
function toJstDateString(date: Date | string) {
	const d = typeof date === "string" ? new Date(date) : date;
	// JSTに変換
	const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
	return jst.toISOString().slice(0, 10);
}

export default function TodoApp({ user, lastLoginAt, isGuest = false }: TodoAppProps) {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [newTask, setNewTask] = useState("");
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [isAddingTask, setIsAddingTask] = useState(false);
	const [togglingTasks, setTogglingTasks] = useState<Set<number>>(new Set());
	const [showTaskDialog, setShowTaskDialog] = useState(false);
	const [prevDayTasks, setPrevDayTasks] = useState<Task[]>([]);
	const [allPrevDayTasks, setAllPrevDayTasks] = useState<Task[]>([]); // 削除用
	const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(
		new Set()
	);
	const [deletedPrevTasks, setDeletedPrevTasks] = useState(false);
	const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
	const [focusedTaskIndex, setFocusedTaskIndex] = useState<number>(-1);
	const [announceMessage, setAnnounceMessage] = useState<string>("");
	const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
	const [editingContent, setEditingContent] = useState<string>("");
	const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
	const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);
	const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
	const [bulkSelectMode] = useState(false);
	const [tasksManager, setTasksManager] = useState<TasksManager | null>(null);
	const router = useRouter();
	const taskRefs = useRef<(HTMLElement | null)[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);

	// DnD sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// TasksManagerを初期化
	useEffect(() => {
		const initTasksManager = async () => {
			const manager = new TasksManager(!isGuest);
			setTasksManager(manager);
		};
		initTasksManager();
	}, [isGuest]);

	// TasksManagerが初期化された後にタスクを読み込み
	useEffect(() => {
		if (tasksManager) {
			loadTasks();
		}
	}, [tasksManager]);

	// キーボードナビゲーション機能
	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		// Dialogが開いている時はスキップ
		if (showTaskDialog || showUserMenu) return;
		
		// 入力フィールドにフォーカスがある時の処理
		if (e.target === inputRef.current) {
			if (e.key === 'Enter') {
				e.preventDefault();
				handleAddTask();
			} else if (e.key === 'Escape') {
				inputRef.current?.blur();
			}
			return;
		}

		switch (e.key) {
			case 'n':
			case 'N':
				// 新しいタスク入力にフォーカス
				if (!e.ctrlKey && !e.metaKey) {
					e.preventDefault();
					inputRef.current?.focus();
				}
				break;
			case 'e':
			case 'E':
				// タスク編集開始
				if (focusedTaskIndex >= 0 && focusedTaskIndex < tasks.length) {
					e.preventDefault();
					const task = tasks[focusedTaskIndex];
					handleStartEdit(task.id, task.content);
				}
				break;
			case 'z':
			case 'Z':
				// 復元機能（Ctrl+Z / Cmd+Z）
				if ((e.ctrlKey || e.metaKey) && deletedTasks.length > 0) {
					e.preventDefault();
					handleRestoreTask();
				}
				break;
			case 'j':
			case 'ArrowDown':
				// 下のタスクに移動
				e.preventDefault();
				if (focusedTaskIndex < tasks.length - 1) {
					const newIndex = focusedTaskIndex + 1;
					setFocusedTaskIndex(newIndex);
					taskRefs.current[newIndex]?.focus();
				}
				break;
			case 'k':
			case 'ArrowUp':
				// 上のタスクに移動
				e.preventDefault();
				if (focusedTaskIndex > 0) {
					const newIndex = focusedTaskIndex - 1;
					setFocusedTaskIndex(newIndex);
					taskRefs.current[newIndex]?.focus();
				} else if (focusedTaskIndex === -1 && tasks.length > 0) {
					const newIndex = tasks.length - 1;
					setFocusedTaskIndex(newIndex);
					taskRefs.current[newIndex]?.focus();
				}
				break;
			case ' ':
			case 'Enter':
				// タスクの完了状態を切り替え
				if (focusedTaskIndex >= 0 && focusedTaskIndex < tasks.length) {
					e.preventDefault();
					const task = tasks[focusedTaskIndex];
					handleToggleTask(task.id.toString());
					setAnnounceMessage(`${task.content} を${task.is_completed ? '未完了' : '完了'}に変更しました`);
				}
				break;
			case 'd':
			case 'Delete':
			case 'Backspace':
				// タスクを削除
				if (focusedTaskIndex >= 0 && focusedTaskIndex < tasks.length) {
					e.preventDefault();
					const task = tasks[focusedTaskIndex];
					handleDeleteTask(task.id.toString());
					setAnnounceMessage(`${task.content} を削除しました`);
					// フォーカスを調整
					const newFocusIndex = Math.min(focusedTaskIndex, tasks.length - 2);
					setFocusedTaskIndex(newFocusIndex);
					setTimeout(() => {
						if (newFocusIndex >= 0) {
							taskRefs.current[newFocusIndex]?.focus();
						} else {
							inputRef.current?.focus();
						}
					}, 100);
				}
				break;
			case 'Escape':
				// フォーカスをリセット
				setFocusedTaskIndex(-1);
				(document.activeElement as HTMLElement)?.blur();
				break;
		}
	}, [tasks, focusedTaskIndex, showTaskDialog, showUserMenu]);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	const deleteAllPrevTasks = async () => {
		if (deletedPrevTasks || !tasksManager) return;
		for (const task of allPrevDayTasks) {
			await tasksManager.deleteTask(task.id);
		}
		setDeletedPrevTasks(true);
	};

	const handleDialogOpenChange = async (open: boolean) => {
		setShowTaskDialog(open);
		if (!open) {
			await deleteAllPrevTasks();
			
			if (isGuest) {
				// ゲストモードの場合は最終アクセス日を更新
				const { updateLastAccessDate } = await import("@/lib/local-tasks");
				await updateLastAccessDate();
			} else {
				// 認証済みユーザーの場合はlast_loginを更新
				await fetch("/api/update-last-login", {
					method: "POST",
					credentials: "include",
				});
			}
			
			loadTasks(); // ダイアログを閉じた後にタスク一覧を再取得
		}
	};

	useEffect(() => {
		const today = new Date();
		const todayStr = toJstDateString(today);
		
		const checkPreviousDayTasks = async () => {
			if (isGuest) {
				// ゲストモードの処理
				console.log('🔍 ゲストモード: 前日タスクチェック開始');
				const { getLastAccessDate } = await import("@/lib/local-tasks");
				const lastAccessStr = getLastAccessDate();
				
				console.log('📅 今日の日付:', todayStr);
				console.log('📅 最終アクセス日:', lastAccessStr);
				console.log('🤖 TasksManager:', !!tasksManager);
				
				// 初回ユーザーかどうかを判定
				const isFirstUser = !lastAccessStr;
				setIsFirstTimeUser(isFirstUser);
				console.log('👤 初回ユーザー:', isFirstUser);
				
				if (lastAccessStr && lastAccessStr !== todayStr && tasksManager) {
					console.log('✅ 前日タスクチェック条件を満たした');
					// 前日のタスクを取得
					const prevTasks = await tasksManager.getTasksBeforeDate(todayStr);
					console.log('📝 前日のタスク数:', prevTasks.length);
					console.log('📝 前日のタスク:', prevTasks);
					
					setAllPrevDayTasks(prevTasks);
					const incompleteTasks = prevTasks.filter((t) => !t.is_completed);
					console.log('📝 未完了タスク数:', incompleteTasks.length);
					console.log('📝 未完了タスク:', incompleteTasks);
					
					setPrevDayTasks(incompleteTasks);
					setSelectedTaskIds(new Set(incompleteTasks.map((t) => t.id)));
					if (incompleteTasks.length > 0) {
						console.log('🔔 ダイアログを表示します');
						setShowTaskDialog(true);
					} else {
						console.log('⚠️ 未完了タスクがないため、ダイアログは表示しません');
						// 未完了タスクがない場合は、最終アクセス日を更新
						const { updateLastAccessDate } = await import("@/lib/local-tasks");
						await updateLastAccessDate();
					}
				} else {
					console.log('❌ 前日タスクチェック条件を満たさない');
					console.log('  - lastAccessStr:', lastAccessStr);
					console.log('  - lastAccessStr !== todayStr:', lastAccessStr !== todayStr);
					console.log('  - tasksManager:', !!tasksManager);
				}
			} else {
				// 認証済みユーザーの処理（既存ロジック）
				const lastLoginStr = lastLoginAt ? toJstDateString(lastLoginAt) : null;
				const isFirstUser = !lastLoginAt;
				setIsFirstTimeUser(isFirstUser);

				if (lastLoginStr !== todayStr) {
					// 今日より前の全タスクを取得
					import("@/lib/tasks").then(({ getTasksBeforeDate }) => {
						getTasksBeforeDate(todayStr).then((tasks) => {
							setAllPrevDayTasks(tasks); // 削除用に全件保持
							const incompleteTasks = tasks.filter((t) => !t.is_completed); // 未完了のみ表示
							setPrevDayTasks(incompleteTasks);
							setSelectedTaskIds(new Set(incompleteTasks.map((t) => t.id)));
							if (incompleteTasks.length > 0) {
								setShowTaskDialog(true);
							}
						});
					});
				}
			}
		};

		if (tasksManager) {
			checkPreviousDayTasks();
		}
	}, [lastLoginAt, isGuest, tasksManager]);

	const loadTasks = async () => {
		if (!tasksManager) return;
		
		try {
			const taskData = await tasksManager.getTasks();
			setTasks(taskData);
		} catch (error) {
			console.error("タスク読み込みエラー:", error);
		}
	};
	// メニューの外側をクリックした時に閉じる
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest(".user-menu-container")) {
				setShowUserMenu(false);
			}
		};

		if (showUserMenu) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showUserMenu]);

	const handleLogout = async () => {
		try {
			const { createClient } = await import("@/utils/supabase/client");
			const supabase = createClient();
			await supabase.auth.signOut();
			router.push("/login");
		} catch (error) {
			console.error("ログアウトエラー:", error);
		}
		setShowUserMenu(false);
	};

	const getCurrentDate = () => {
		const today = new Date();
		const year = today.getFullYear();
		const month = today.getMonth() + 1;
		const date = today.getDate();
		const dayNames = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		];
		const monthNames = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];
		const dayName = dayNames[today.getDay()];
		const monthName = monthNames[today.getMonth()];

		return {
			dayName,
			monthName,
			date,
			year,
			fullDate: `${year}年${month}月${date}日`,
			japaneseDay: ["日", "月", "火", "水", "木", "金", "土"][today.getDay()],
		};
	};

	const handleAddTask = useCallback(async () => {
		if (newTask.trim() === "" || isAddingTask || !tasksManager) return;

		const taskContent = newTask.trim();
		setNewTask("");
		setIsAddingTask(true);

		// 楽観的更新：即座にUIに追加
		const optimisticTask: Task = {
			id: Date.now(), // 仮のID
			user_id: isGuest ? 'guest' : (user?.id || ''),
			order_index: tasks.length + 1,
			content: taskContent,
			is_completed: false,
			created_at: new Date().toISOString(),
		};

		setTasks((prev) => [...prev, optimisticTask]);

		try {
			// 統一されたタスク管理インターフェースを使用
			const newTaskData = await tasksManager.addTask(taskContent);

			// 楽観的更新を実際のデータで置き換え
			setTasks((prev) =>
				prev.map((task) => (task.id === optimisticTask.id ? newTaskData : task))
			);
		} catch (error) {
			console.error("タスク追加エラー:", error);
			// エラー時は楽観的更新を元に戻す
			setTasks((prev) => prev.filter((task) => task.id !== optimisticTask.id));
			setNewTask(taskContent); // 入力内容を復元
		} finally {
			setIsAddingTask(false);
		}
	}, [newTask, isAddingTask, tasks.length, user?.id, isGuest, tasksManager]);

	const handleToggleTask = useCallback(async (id: string) => {
		const taskId = Number(id);

		// 既に処理中の場合は何もしない
		if (togglingTasks.has(taskId) || !tasksManager) return;

		// 楽観的更新：即座にUIを更新
		setTogglingTasks((prev) => new Set(prev).add(taskId));
		setTasks((prev) =>
			prev.map((task) =>
				task.id === taskId
					? { ...task, is_completed: !task.is_completed }
					: task
			)
		);

		try {
			// 統一されたタスク管理インターフェースを使用
			await tasksManager.toggleTask(taskId);
		} catch (error) {
			console.error("タスク更新エラー:", error);
			// エラー時は楽観的更新を元に戻す
			setTasks((prev) =>
				prev.map((task) =>
					task.id === taskId
						? { ...task, is_completed: !task.is_completed }
						: task
				)
			);
		} finally {
			setTogglingTasks((prev) => {
				const newSet = new Set(prev);
				newSet.delete(taskId);
				return newSet;
			});
		}
	}, [togglingTasks, tasksManager]);

	const handleDeleteTask = useCallback(async (id: string) => {
		const taskToDelete = tasks.find(task => task.id === Number(id));
		if (!taskToDelete) return;

		// 削除確認ダイアログを表示
		setDeleteConfirmTask(taskToDelete);
	}, [tasks]);

	// 削除確認後の実際の削除処理
	const handleConfirmDelete = useCallback(async () => {
		if (!deleteConfirmTask || !tasksManager) return;

		// 削除したタスクを履歴に保存（復元用）
		setDeletedTasks(prev => [...prev, deleteConfirmTask]);
		
		// UI から即座に削除
		setTasks(prev => prev.filter(task => task.id !== deleteConfirmTask.id));
		
		try {
			await tasksManager.deleteTask(deleteConfirmTask.id);
			setAnnounceMessage(`タスク「${deleteConfirmTask.content}」を削除しました。Ctrl+Zで復元できます`);
		} catch (error) {
			console.error("タスク削除エラー:", error);
			// エラー時は UI を元に戻す
			setTasks(prev => [...prev, deleteConfirmTask]);
			setDeletedTasks(prev => prev.filter(t => t.id !== deleteConfirmTask.id));
			setAnnounceMessage("タスクの削除に失敗しました");
		} finally {
			setDeleteConfirmTask(null);
		}
	}, [deleteConfirmTask, tasksManager]);

	// 削除キャンセル
	const handleCancelDelete = useCallback(() => {
		setDeleteConfirmTask(null);
	}, []);

	// タスク編集の開始
	const handleStartEdit = useCallback((taskId: number, currentContent: string) => {
		setEditingTaskId(taskId);
		setEditingContent(currentContent);
	}, []);

	// タスク編集のキャンセル
	const handleCancelEdit = useCallback(() => {
		setEditingTaskId(null);
		setEditingContent("");
	}, []);

	// タスク編集の保存
	const handleSaveEdit = useCallback(async () => {
		if (editingTaskId === null || editingContent.trim() === "" || !tasksManager) return;
		
		const trimmedContent = editingContent.trim();
		
		// 楽観的更新
		setTasks(prev => 
			prev.map(task => 
				task.id === editingTaskId 
					? { ...task, content: trimmedContent }
					: task
			)
		);
		
		try {
			await tasksManager.updateTask(editingTaskId, trimmedContent);
			setAnnounceMessage(`タスクを「${trimmedContent}」に更新しました`);
		} catch (error) {
			console.error("タスク更新エラー:", error);
			// エラー時は楽観的更新を元に戻す
			setTasks(prev => 
				prev.map(task => 
					task.id === editingTaskId 
						? { ...task, content: tasks.find(t => t.id === editingTaskId)?.content || "" }
						: task
				)
			);
			setAnnounceMessage("タスクの更新に失敗しました");
		} finally {
			setEditingTaskId(null);
			setEditingContent("");
		}
	}, [editingTaskId, editingContent, tasks, tasksManager]);

	// タスクの復元機能
	const handleRestoreTask = useCallback(async () => {
		const lastDeleted = deletedTasks[deletedTasks.length - 1];
		if (!lastDeleted || !tasksManager) return;

		try {
			const restoredTask = await tasksManager.addTask(lastDeleted.content);
			setTasks(prev => [...prev, restoredTask]);
			setDeletedTasks(prev => prev.slice(0, -1));
			setAnnounceMessage(`タスク「${lastDeleted.content}」を復元しました`);
		} catch (error) {
			console.error("タスク復元エラー:", error);
			setAnnounceMessage("タスクの復元に失敗しました");
		}
	}, [deletedTasks, tasksManager]);



	// タスクの選択状態を切り替え
	const handleToggleTaskSelection = useCallback((taskId: number) => {
		setSelectedTasks(prev => {
			const newSet = new Set(prev);
			if (newSet.has(taskId)) {
				newSet.delete(taskId);
			} else {
				newSet.add(taskId);
			}
			return newSet;
		});
	}, []);

	

	

	

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over?.id && tasksManager) {
			const oldIndex = tasks.findIndex((item) => item.id === Number(active.id));
			const newIndex = tasks.findIndex((item) => item.id === Number(over?.id));

			const newTasks = arrayMove(tasks, oldIndex, newIndex);
			setTasks(newTasks);
			try {
				// 統一されたタスク管理インターフェースを使用
				await tasksManager.updateTaskOrder(newTasks.map((task) => task.id));
			} catch (error) {
				console.error("タスク並び替えエラー:", error);
				// エラー時は元の順序に戻す
				loadTasks();
			}
		}
	};

	// 前日タスクの選択状態を切り替え
	const toggleSelectTask = (id: number) => {
		setSelectedTaskIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	const handleImportTasks = async () => {
		if (!tasksManager) return;
		
		const importTasks = prevDayTasks.filter((t) => selectedTaskIds.has(t.id));
		// 選択したタスクは今日の日付で複製
		for (const task of importTasks) {
			await tasksManager.addTask(task.content);
		}
		
		// 前日タスクを削除（ゲスト・認証済み共通）
		for (const task of allPrevDayTasks) {
			await tasksManager.deleteTask(task.id);
		}
		
		// 認証済みユーザーのみlast_login更新
		if (!isGuest) {
			await fetch("/api/update-last-login", {
				method: "POST",
				credentials: "include",
			});
		}
		
		setShowTaskDialog(false);
		loadTasks();
	};

	// スクリーンリーダー向けのアナウンス機能
	useEffect(() => {
		if (announceMessage) {
			const timer = setTimeout(() => {
				setAnnounceMessage("");
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [announceMessage]);

	return (
		<>
			{/* スクリーンリーダー向けライブリージョン */}
			<div
				aria-live="polite"
				aria-atomic="true"
				className="sr-only"
			>
				{announceMessage}
			</div>

			{/* 削除確認Dialog */}
			<Dialog open={!!deleteConfirmTask} onOpenChange={(open) => !open && handleCancelDelete()}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>タスクを削除しますか？</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<p className="text-sm text-gray-600 mb-3">
							以下のタスクを削除してもよろしいですか？
						</p>
						<div className="bg-gray-50 rounded-lg p-3 border">
							<p className="font-medium text-gray-900">
								{deleteConfirmTask?.content}
							</p>
						</div>
						<p className="text-xs text-gray-500 mt-2">
							※削除後はCtrl+Zで復元できます
						</p>
					</div>
					<DialogFooter className="gap-2">
						<Button
							variant="outline"
							onClick={handleCancelDelete}
						>
							キャンセル
						</Button>
						<Button
							variant="destructive"
							onClick={handleConfirmDelete}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							削除する
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* 取捨選択Dialog */}
			<Dialog open={showTaskDialog} onOpenChange={handleDialogOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>前日のタスクを引き継ぎますか？</DialogTitle>
					</DialogHeader>
					{/* 説明部分を独立して配置 */}
					<div className='mb-4'>
						{isFirstTimeUser ? (
							<div className='space-y-3 text-sm'>
								<div className='text-gray-600'>
									<span className='font-medium text-blue-600'>
										初回ログイン時の案内
									</span>
								</div>
								<div>
									このダイアログは、前日に未完了だったタスクを今日に引き継ぐかを選択する機能です。
								</div>
								<div>
									✓ チェックが入ったタスクが今日に引き継がれます
									<br />
									✓ 不要なタスクのチェックを外すことで、引き継がずに削除できます
									<br />✓ 今回は前日のタスクがないため、この画面は表示のみです
								</div>
								<div className='text-gray-500'>
									明日以降のログイン時に、前日のタスクがあれば同様の選択画面が表示されます。
								</div>
							</div>
						) : (
							<div className='text-sm text-gray-600'>
								前日（{prevDayTasks[0]?.created_at?.slice(0, 10) || "-"}
								）のタスクを今日に引き継ぐか選択してください。
							</div>
						)}
					</div>
					{/* Dialog内のタスク選択リスト */}
					<div className='space-y-2 max-h-60 overflow-y-auto'>
						{prevDayTasks.map((task) => (
							<div key={task.id} className='flex items-center gap-2'>
								<Checkbox
									checked={selectedTaskIds.has(task.id)}
									onCheckedChange={() => toggleSelectTask(task.id)}
									id={`import-task-${task.id}`}
								/>
								<label htmlFor={`import-task-${task.id}`}>{task.content}</label>
							</div>
						))}
						{prevDayTasks.length === 0 && <div>前日のタスクはありません。</div>}
					</div>
					<DialogFooter>
						<Button
							onClick={handleImportTasks}
							disabled={selectedTaskIds.size === 0}
						>
							選択したタスクを今日に引き継ぐ
						</Button>
						<DialogClose asChild>
							<Button variant='outline'>スキップ</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{/* 既存のTodoApp UI */}
			<div className='min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100/40 pt-8 sm:pt-10'>
				<div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
					{/* Header with current date */}
					<div>
						<div className='flex justify-between mb-4'>
							<div className='items-center relative'>
								{/* Date Display */}
								<div className='flex items-end gap-5 mb-4'>
									{/* Large Date Number */}
									<div className='relative'>
										<span className='text-6xl sm:text-7xl font-extralight text-gray-900 leading-none tracking-tight drop-shadow-sm'>
											{getCurrentDate().date}
										</span>
										<div className='absolute -top-1 -right-5 w-5 h-5 bg-gradient-to-br from-gray-800 to-black rounded-full shadow-lg'></div>
									</div>

									{/* Month and Year */}
									<div className='pb-2'>
										<div className='text-xl sm:text-2xl font-light text-gray-800 mb-1 tracking-wide'>
											{getCurrentDate().monthName}
										</div>
										<div className='text-sm sm:text-base font-extralight text-gray-600 tracking-widest'>
											{getCurrentDate().year}
										</div>
									</div>
								</div>

								{/* Day of Week */}
								<div className='flex items-center gap-4'>
									<div className='flex items-center gap-3'>
										<div className='w-7 h-7 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-inner border border-gray-300/50'>
											<span className='text-sm font-medium text-gray-800'>
												{getCurrentDate().japaneseDay}
											</span>
										</div>
										<span className='text-lg sm:text-xl font-light text-gray-700 tracking-wide'>
											{getCurrentDate().dayName}
										</span>
									</div>
								</div>

								{/* Subtitle */}
							</div>
							{isGuest ? (
								// ゲストモード用のログイン促進UI
								<div className='flex flex-col items-end gap-2'>
									<div className='text-right'>
										<p className='text-sm font-medium text-gray-700'>ゲストモード</p>
										<p className='text-xs text-gray-500'>データはこのデバイスのみ保存</p>
									</div>
									<div className='flex gap-2'>
										<Button
											variant="outline"
											size="sm"
											onClick={() => router.push("/login")}
											className="text-xs"
										>
											ログイン
										</Button>
										<Button
											size="sm"
											onClick={() => router.push("/signup")}
											className="text-xs bg-blue-600 hover:bg-blue-700"
										>
											登録
										</Button>
									</div>
								</div>
							) : (
								// 認証済みユーザー用のメニュー
								<div className='relative user-menu-container'>
									<button
										className='cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full'
										onClick={() => setShowUserMenu(!showUserMenu)}
										aria-label='ユーザーメニューを開く'
										aria-expanded={showUserMenu}
										aria-haspopup='true'
									>
										<Avatar className='border-2 border-white shadow-md size-12 hover:ring-4 hover:ring-gray-200'>
											<AvatarImage src={user?.avatarUrl} />
											<AvatarFallback className='bg-gradient-to-br from-gray-800 to-black text-white font-medium'>
												{user?.displayName?.charAt(0) || 'U'}
											</AvatarFallback>
										</Avatar>
									</button>

									{/* User Menu */}
									{showUserMenu && (
										<div className='absolute right-0 top-14 w-52 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-300/60 py-3 z-50'>
											<div className='px-5 py-3 border-b border-gray-200/60'>
												<p className='text-sm font-medium text-gray-900'>
													{user?.displayName}
												</p>
												<p className='text-xs text-gray-600 mt-0.5'>{user?.email}</p>
											</div>
											<button
												onClick={() => {
													setShowUserMenu(false);
													router.push("/profile-setup");
												}}
												className='w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 flex items-center gap-3'
											>
												<User className='w-4 h-4' />
												プロフィール編集
											</button>
											<button
												onClick={handleLogout}
												className='w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 flex items-center gap-3'
											>
												<LogOut className='w-4 h-4' />
												ログアウト
											</button>
										</div>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Add task section */}
					<div className='mb-8 sm:mb-10'>
						<div className='relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-300/50 shadow-lg hover:shadow-xl p-6 sm:p-8'>
							<form
								onSubmit={(e) => {
									e.preventDefault();
									handleAddTask();
								}}
							>
								<div className='flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center'>
									{/* Input field with enhanced styling */}
									<div className='flex-1 relative'>
										<Input
											ref={inputRef}
											type='text'
											placeholder='今日は何をしますか？'
											value={newTask}
											onChange={(e) => setNewTask(e.target.value)}
											disabled={isAddingTask}
											className='w-full border-0 border-b-2 border-gray-300 rounded-none bg-transparent px-0 py-4 placeholder:text-gray-500 focus:border-gray-800 focus:ring-0 focus-visible:ring-0 focus:outline-none font-normal text-lg disabled:opacity-50'
											aria-label='新しいタスクを入力'
										/>
										{/* Animated underline */}
										<div className='absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-gray-800 to-black transform scale-x-0 origin-left w-full focus-within:scale-x-100'></div>
									</div>
									
									{/* Enhanced Button */}
									<Button
										type='submit'
										disabled={isAddingTask || !newTask.trim()}
										className='bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white px-8 py-3 font-medium tracking-wide shadow-lg hover:shadow-xl disabled:opacity-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none'
										size='default'
										aria-label='新しいタスクを追加'
									>
										{isAddingTask ? (
											<div className='flex items-center'>
												<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2'></div>
												<span className='text-sm font-medium'>追加中</span>
											</div>
										) : (
											<>
												<Plus className='w-5 h-5 mr-2' />
												追加
											</>
										)}
									</Button>
								</div>
							</form>
						</div>
					</div>

					{/* Tasks list */}
					<div className='space-y-3 sm:space-y-4' role="list" aria-label="今日のタスク一覧">
						{tasks.length === 0 ? (
							<div className='text-center py-16 sm:py-20' role="status" aria-live="polite">
								<div className='w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg border border-gray-300/50'>
									<div className='w-6 h-6 sm:w-8 sm:h-8 border-2 border-gray-600 rounded-full'></div>
								</div>
								<p className='text-gray-700 font-light text-base sm:text-lg mb-4 sm:mb-6'>
									まだタスクがありません
								</p>
								<p className='text-gray-600 font-light text-sm'>
									上のフィールドからタスクを追加してください
								</p>
							</div>
						) : (
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={tasks.map((task) => task.id)}
									strategy={verticalListSortingStrategy}
								>
									<div className='space-y-3 sm:space-y-4'>
										{tasks.map((task, index) => (
											<div 
												key={task.id} 
												className=''
												style={{ animationDelay: `${index * 50}ms` }}
												ref={(el) => {
													taskRefs.current[index] = el;
												}}
											>
												<SortableTaskItem
													task={task}
													onToggle={handleToggleTask}
													onDelete={handleDeleteTask}
													isToggling={togglingTasks.has(task.id)}
													taskIndex={index}
													isFocused={focusedTaskIndex === index}
													onFocus={setFocusedTaskIndex}
													isEditing={editingTaskId === task.id}
													editingContent={editingContent}
													onStartEdit={handleStartEdit}
													onCancelEdit={handleCancelEdit}
													onSaveEdit={handleSaveEdit}
													onEditingContentChange={setEditingContent}
													bulkSelectMode={bulkSelectMode}
													isSelected={selectedTasks.has(task.id)}
													onToggleSelection={handleToggleTaskSelection}
												/>
											</div>
										))}
									</div>
								</SortableContext>
							</DndContext>
						)}
					</div>

					{/* Enhanced Footer with Progress */}
					{tasks.length > 0 && (
						<div className='mt-12 sm:mt-16 pt-6 sm:pt-8'>
							{/* Progress Bar */}
							<div className='mb-6'>
								<div className='flex justify-between items-center mb-3'>
									<span className='text-sm font-medium text-gray-900'>今日の進捗</span>
									<span className='text-sm font-medium text-gray-700'>
										{Math.round((tasks.filter(task => task.is_completed).length / tasks.length) * 100)}%
									</span>
								</div>
								<div className='w-full bg-gray-300 rounded-full h-3 shadow-inner'>
									<div 
										className='bg-gradient-to-r from-gray-700 to-gray-800 h-3 rounded-full shadow-sm'
										style={{ width: `${(tasks.filter(task => task.is_completed).length / tasks.length) * 100}%` }}
									></div>
								</div>
							</div>
							
{/* Stats */}
							<div className='flex justify-center gap-8 py-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-300/40'>
								<div className='flex items-center gap-2 text-center'>
									<div className='w-3 h-3 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full shadow-sm'></div>
									<span className='text-sm font-medium text-gray-900'>
										残り {tasks.filter((task) => !task.is_completed).length} 件
									</span>
								</div>
								<div className='w-px bg-gray-500'></div>
								<div className='flex items-center gap-2 text-center'>
									<div className='w-3 h-3 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full shadow-sm'></div>
									<span className='text-sm font-medium text-gray-900'>
										完了 {tasks.filter((task) => task.is_completed).length} 件
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
