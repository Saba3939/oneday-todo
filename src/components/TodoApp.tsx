"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@radix-ui/react-checkbox";
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

interface Task {
	id: string;
	text: string;
	completed: boolean;
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
}: {
	task: Task;
	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
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
						id={task.id}
						checked={task.completed}
						onCheckedChange={() => onToggle(task.id)}
						className='w-6 h-6 border-2 border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900 rounded-lg transition-all duration-300'
					/>

					{/* Task text */}
					<label
						htmlFor={task.id}
						className={`flex-1 text-lg cursor-pointer transition-all duration-300 font-light ${
							task.completed
								? "line-through text-gray-400"
								: "text-gray-800 hover:text-gray-600"
						}`}
					>
						{task.text}
					</label>

					{/* Action buttons - only visible on hover */}
					<div className='flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300'>
						<Link href={`/pomodoro?task=${encodeURIComponent(task.text)}`}>
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
							onClick={() => onDelete(task.id)}
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
	const router = useRouter();

	// DnD sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

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

	const addTask = () => {
		if (newTask.trim() === "") return;
		setTasks([
			...tasks,
			{ id: Date.now().toString(), text: newTask, completed: false },
		]);
		setNewTask("");
	};

	const toggleTask = (id: string) => {
		setTasks(
			tasks.map((task) =>
				task.id === id ? { ...task, completed: !task.completed } : task
			)
		);
	};

	const deleteTask = (id: string) => {
		setTasks(tasks.filter((task) => task.id !== id));
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over?.id) {
			setTasks((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over?.id);

				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-50 to-white pt-12 sm:pt-15'>
			<div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
				{/* Header with current date */}
				<div>
					<div className='flex justify-between mb-8'>
						<div className='items-center relative'>
							{/* Date Display */}
							<div className='flex items-end gap-6 mb-4'>
								{/* Large Date Number */}
								<div className='relative'>
									<span className='text-8xl font-extralight text-gray-900 leading-none tracking-tight'>
										{getCurrentDate().date}
									</span>
									<div className='absolute -top-2 -right-8 w-6 h-6 bg-gradient-to-br from-gray-600 to-gray-900 rounded-full shadow-lg'></div>
								</div>

								{/* Month and Year */}
								<div className='pb-2'>
									<div className='text-2xl font-light text-gray-700 mb-1 tracking-wide'>
										{getCurrentDate().monthName}
									</div>
									<div className='text-lg font-extralight text-gray-500 tracking-widest'>
										{getCurrentDate().year}
									</div>
								</div>
							</div>

							{/* Day of Week */}
							<div className='flex items-center gap-4 mb-6'>
								<div className='flex items-center gap-3'>
									<div className='w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner'>
										<span className='text-sm font-medium text-gray-600'>
											{getCurrentDate().japaneseDay}
										</span>
									</div>
									<span className='text-xl font-light text-gray-600 tracking-wide'>
										{getCurrentDate().dayName}
									</span>
								</div>
							</div>

							{/* Subtitle */}
							<div className='flex items-center gap-3 text-gray-500'>
								<Calendar className='w-4 h-4' />
								<span className='text-sm font-light tracking-wide'>
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
				<div className='mb-8'>
					<div className='space-y-4 md:space-y-0 md:relative'>
						<form action={addTask}>
							{/* Input field with responsive padding */}
							<Input
								type='text'
								placeholder='今日は何をしますか？'
								value={newTask}
								onChange={(e) => setNewTask(e.target.value)}
								className='w-full border-0 border-b-2 border-gray-200 rounded-none bg-transparent px-2 pr-2 md:pr-32 py-6 placeholder:text-gray-400 focus:border-gray-900 focus:ring-0 focus-visible:ring-0 focus:outline-none transition-all duration-300 font-light'
							/>
							{/* Button: stacked on mobile, absolute on desktop */}
							<Button
								onClick={addTask}
								className='w-full md:w-auto md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 text-white px-8 py-3 font-light tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl'
								size='default'
							>
								<Plus className='w-4 h-4 mr-2' />
								追加
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
											onToggle={toggleTask}
											onDelete={deleteTask}
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
								残り {tasks.filter((task) => !task.completed).length} 件
							</span>
							<span className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-green-400 rounded-full'></div>
								完了 {tasks.filter((task) => task.completed).length} 件
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
