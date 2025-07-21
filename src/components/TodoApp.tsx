"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Calendar,
	Play,
	Plus,
	Trash2,
	User,
	LogOut,
	GripVertical,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	addTask,
	deleteTask,
	getTasks,
	updateTaskOrder,
	toggleTask as toggleTaskAction,
} from "@/lib/tasks";

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
	user: UserProfile;
}

// ソート可能なタスクアイテムコンポーネント
function SortableTaskItem({
	task,
	onToggle,
	onDelete,
	isToggling,
}: {
	task: Task;
	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
	isToggling: boolean;
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
	};

	return (
		<Card
			ref={setNodeRef}
			style={style}
			className='group border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-lg'
		>
			<CardContent>
				<div className='flex items-center gap-2'>
					{/* Drag Handle */}
					<button
						{...attributes}
						{...listeners}
						className='cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors p-1'
						title='ドラッグして並び替え'
					>
						<GripVertical className='w-4 h-4' />
					</button>

					{/* Checkbox */}
					<Checkbox
						id={task.id.toString()}
						checked={task.is_completed}
						onCheckedChange={() => onToggle(task.id.toString())}
						className='w-6 h-6 border-2 border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900 rounded-lg transition-all duration-300'
						disabled={isToggling}
					/>

					{/* Task text */}
					<label
						htmlFor={task.id.toString()}
						className={`flex-1 text-lg cursor-pointer transition-all duration-300 font-light ${
							task.is_completed
								? "line-through text-gray-400"
								: "text-gray-800 hover:text-gray-600"
						}`}
					>
						{task.content}
					</label>

					{/* Action buttons - only visible on hover */}
					<div className='flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300'>
						<Link href={`/pomodoro?task=${encodeURIComponent(task.content)}`}>
							<Button
								variant='ghost'
								size='sm'
								className='h-10 w-10 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300'
								title='ポモドーロタイマーを開始'
							>
								<Play className='w-4 h-4' />
							</Button>
						</Link>
						<Button
							variant='ghost'
							size='sm'
							className='h-10 w-10 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300'
							onClick={() => onDelete(task.id.toString())}
							title='タスクを削除'
						>
							<Trash2 className='w-4 h-4' />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default function TodoApp({ user }: TodoAppProps) {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [newTask, setNewTask] = useState("");
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [isAddingTask, setIsAddingTask] = useState(false);
	const [togglingTasks, setTogglingTasks] = useState<Set<number>>(new Set());
	const router = useRouter();

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

	useEffect(() => {
		loadTasks();
	}, []);

	const loadTasks = async () => {
		try {
			const taskData = await getTasks();
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

	const handleAddTask = async () => {
		if (newTask.trim() === "" || isAddingTask) return;

		const taskContent = newTask.trim();
		setNewTask("");
		setIsAddingTask(true);

		// 楽観的更新：即座にUIに追加
		const optimisticTask: Task = {
			id: Date.now(), // 仮のID
			user_id: user.id,
			order_index: tasks.length + 1,
			content: taskContent,
			is_completed: false,
			created_at: new Date().toISOString(),
		};

		setTasks((prev) => [...prev, optimisticTask]);

		try {
			// 実際のAPI呼び出し
			const newTaskData = await addTask(taskContent);

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
	};

	const handleToggleTask = async (id: string) => {
		const taskId = Number(id);

		// 既に処理中の場合は何もしない
		if (togglingTasks.has(taskId)) return;

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
			// 実際のAPI呼び出し
			await toggleTaskAction(taskId);
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
	};

	const handleDeleteTask = async (id: string) => {
		try {
			await deleteTask(id);
			setTasks(tasks.filter((task) => task.id !== Number(id)));
		} catch (error) {
			console.error("タスク削除エラー:", error);
		}
	};
	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over?.id) {
			const oldIndex = tasks.findIndex((item) => item.id === Number(active.id));
			const newIndex = tasks.findIndex((item) => item.id === Number(over?.id));

			const newTasks = arrayMove(tasks, oldIndex, newIndex);
			setTasks(newTasks);
			try {
				// 数値のID配列を渡す
				await updateTaskOrder(newTasks.map((task) => task.id));
			} catch (error) {
				console.error("タスク並び替えエラー:", error);
				// エラー時は元の順序に戻す
				loadTasks();
			}
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-50 to-white pt-8 sm:pt-10'>
			<div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Header with current date */}
				<div>
					<div className='flex justify-between mb-6'>
						<div className='items-center relative'>
							{/* Date Display */}
							<div className='flex items-end gap-4 mb-3'>
								{/* Large Date Number */}
								<div className='relative'>
									<span className='text-6xl sm:text-7xl font-extralight text-gray-900 leading-none tracking-tight'>
										{getCurrentDate().date}
									</span>
									<div className='absolute -top-1 -right-4 w-4 h-4 bg-gradient-to-br from-gray-600 to-gray-900 rounded-full shadow-lg'></div>
								</div>

								{/* Month and Year */}
								<div className='pb-1'>
									<div className='text-lg sm:text-xl font-light text-gray-700 mb-1 tracking-wide'>
										{getCurrentDate().monthName}
									</div>
									<div className='text-sm sm:text-base font-extralight text-gray-500 tracking-widest'>
										{getCurrentDate().year}
									</div>
								</div>
							</div>

							{/* Day of Week */}
							<div className='flex items-center gap-3 mb-4'>
								<div className='flex items-center gap-2'>
									<div className='w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner'>
										<span className='text-sm font-medium text-gray-600'>
											{getCurrentDate().japaneseDay}
										</span>
									</div>
									<span className='text-base sm:text-lg font-light text-gray-600 tracking-wide'>
										{getCurrentDate().dayName}
									</span>
								</div>
							</div>

							{/* Subtitle */}
							<div className='flex items-center gap-2 text-gray-500'>
								<Calendar className='w-4 h-4' />
								<span className='text-xs font-light tracking-wide'>
									今日という日に集中する
								</span>
							</div>
						</div>
						<div className='relative user-menu-container'>
							<div
								className='cursor-pointer'
								onClick={() => setShowUserMenu(!showUserMenu)}
							>
								<Avatar className='drop-shadow-sm size-12 hover:ring-2 hover:ring-gray-300 transition-all duration-200'>
									<AvatarImage src={user.avatarUrl} />
									<AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
								</Avatar>
							</div>

							{/* User Menu */}
							{showUserMenu && (
								<div className='absolute right-0 top-14 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10'>
									<div className='px-4 py-2 border-b border-gray-100'>
										<p className='text-sm font-medium text-gray-900'>
											{user.displayName}
										</p>
										<p className='text-xs text-gray-500'>{user.email}</p>
									</div>
									<button
										onClick={() => {
											setShowUserMenu(false);
											router.push("/profile-setup");
										}}
										className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2'
									>
										<User className='w-4 h-4' />
										プロフィール編集
									</button>
									<button
										onClick={handleLogout}
										className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2'
									>
										<LogOut className='w-4 h-4' />
										ログアウト
									</button>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Add task section */}
				<div className='mb-6'>
					<div className='space-y-4 md:space-y-0 md:relative'>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleAddTask();
							}}
						>
							{/* Input field with responsive padding */}
							<Input
								type='text'
								placeholder='今日は何をしますか？'
								value={newTask}
								onChange={(e) => setNewTask(e.target.value)}
								disabled={isAddingTask}
								className='w-full border-0 border-b-2 border-gray-200 rounded-none bg-transparent px-2 pr-2 md:pr-32 py-6 placeholder:text-gray-400 focus:border-gray-900 focus:ring-0 focus-visible:ring-0 focus:outline-none transition-all duration-300 font-light disabled:opacity-50'
							/>
							{/* Button: stacked on mobile, absolute on desktop */}
							<Button
								type='submit'
								disabled={isAddingTask}
								className='w-full md:w-auto md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 text-white px-8 py-3 font-light tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50'
								size='default'
							>
								{isAddingTask ? (
									<div className='flex items-center'>
										<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
										追加中...
									</div>
								) : (
									<>
										<Plus className='w-4 h-4 mr-2' />
										追加
									</>
								)}
							</Button>
						</form>
					</div>
				</div>

				{/* Tasks list */}
				<div className='space-y-2'>
					{tasks.length === 0 ? (
						<div className='text-center py-24'>
							<div className='w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner'>
								<div className='w-8 h-8 border-2 border-gray-400 rounded-full'></div>
							</div>
							<p className='text-gray-500 font-light text-lg mb-6'>
								まだタスクがありません
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
								<div className='space-y-2'>
									{tasks.map((task) => (
										<SortableTaskItem
											key={task.id}
											task={task}
											onToggle={handleToggleTask}
											onDelete={handleDeleteTask}
											isToggling={togglingTasks.has(task.id)}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
					)}
				</div>

				{/* Footer */}
				{tasks.length > 0 && (
					<div className='mt-20 pt-8 border-t border-gray-200'>
						<div className='flex justify-between items-center text-sm text-gray-500 font-light'>
							<span className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-orange-400 rounded-full'></div>
								残り {tasks.filter((task) => !task.is_completed).length} 件
							</span>
							<span className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-green-400 rounded-full'></div>
								完了 {tasks.filter((task) => task.is_completed).length} 件
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
