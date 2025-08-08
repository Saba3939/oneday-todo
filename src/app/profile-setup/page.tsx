"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { User, Upload, Check } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { updateProfile, skipProfileSetup } from "@/app/profile-setup/action";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfileSetup() {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [username, setUsername] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [loading, setLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	// ページロード時に既存のプロフィール情報を取得
	useEffect(() => {
		async function loadProfile() {
			try {
				const {
					data: { user },
					error,
				} = await supabase.auth.getUser();

				if (error || !user) {
					// ユーザー取得に失敗
					router.push("/login");
					return;
				}

				// 既存のプロフィール情報があれば設定
				if (user.user_metadata) {
					setUsername(user.user_metadata.username || "");
					setDisplayName(user.user_metadata.display_name || "");
					if (user.user_metadata.avatar_url) {
						setSelectedImage(user.user_metadata.avatar_url);
					}
				}
			} catch {
				// プロフィール読み込みに失敗
			} finally {
				setLoading(false);
			}
		}

		loadProfile();
	}, [router, supabase]);

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setSelectedImage(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	// ローディング中の表示
	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-zinc-50 to-white flex items-center justify-center p-6'>
				<div className='text-zinc-600 text-lg'>
					プロフィール情報を読み込み中...
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-zinc-50 to-white flex items-center justify-center p-6'>
			<Card className='w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden'>
				<CardHeader className='text-center pt-12'>
					<div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-zinc-900 to-zinc-700 rounded-full mb-6 shadow-lg mx-auto'>
						<User className='w-10 h-10 text-white' />
					</div>
					<CardTitle className='text-4xl font-extralight text-zinc-900 tracking-wide mb-2'>
						プロフィール設定
					</CardTitle>
					<p className='text-zinc-600 font-light text-lg'>
						あなたのプロフィールを設定しましょう
					</p>
				</CardHeader>
				<CardContent className='p-8'>
					<form 
						action={async (formData) => {
							setIsSubmitting(true);
							try {
								await updateProfile(formData);
							} finally {
								setIsSubmitting(false);
							}
						}}
						className='space-y-6'
					>
						{/* Avatar Upload */}
						<div className='flex flex-col items-center space-y-4'>
							<div className='relative'>
								<Avatar className='w-24 h-24 border-4 border-zinc-200'>
									{selectedImage ? (
										<Image
											src={selectedImage}
											alt='プロフィール画像'
											width={96}
											height={96}
											className='w-full h-full object-cover rounded-full'
											unoptimized
										/>
									) : (
										<div className='w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 rounded-full flex items-center justify-center'>
											<User className='w-10 h-10 text-zinc-500' />
										</div>
									)}
								</Avatar>
								<Label
									htmlFor='avatar'
									className='absolute bottom-0 right-0 bg-zinc-900 text-white rounded-full p-2 cursor-pointer hover:bg-zinc-800 transition-colors'
								>
									<Upload className='w-4 h-4' />
								</Label>
								<Input
									id='avatar'
									type='file'
									accept='image/*'
									onChange={handleImageChange}
									className='sr-only'
									name='avatar'
								/>
							</div>
							<p className='text-sm text-zinc-500 font-light'>
								プロフィール画像をアップロード
							</p>
						</div>

						{/* Username Input */}
						<div>
							<Label htmlFor='username' className='sr-only'>
								ユーザー名
							</Label>
							<div className='relative'>
								<User className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400' />
								<Input
									id='username'
									type='text'
									name='username'
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									placeholder='ユーザー名'
									required
									className='w-full pl-10 pr-4 py-3 border border-zinc-200 bg-zinc-50/50 text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-0 focus-visible:ring-0 focus:outline-none transition-all duration-300 font-light'
								/>
							</div>
						</div>

						{/* Display Name Input */}
						<div>
							<Label htmlFor='displayName' className='sr-only'>
								表示名
							</Label>
							<div className='relative'>
								<User className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400' />
								<Input
									id='displayName'
									type='text'
									name='displayName'
									value={displayName}
									onChange={(e) => setDisplayName(e.target.value)}
									placeholder='表示名（任意）'
									className='w-full pl-10 pr-4 py-3 border border-zinc-200 bg-zinc-50/50 text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-0 focus-visible:ring-0 focus:outline-none transition-all duration-300 font-light'
								/>
							</div>
						</div>

						{/* Complete Setup Button */}
						<Button
							type='submit'
							disabled={isSubmitting || loading}
							className='w-full bg-gradient-to-r from-zinc-900 to-zinc-700 hover:from-zinc-800 hover:to-zinc-600 text-white px-8 py-4 font-light tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{isSubmitting ? (
								<div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
							) : (
								<Check className='w-5 h-5 mr-2' />
							)}
							{isSubmitting ? '保存中...' : 'プロフィールを完了'}
						</Button>
					</form>

					{/* Skip Option */}
					<div className='mt-6 text-center'>
						<form 
							action={async () => {
								if (isSubmitting) return;
								setIsSubmitting(true);
								try {
									await skipProfileSetup();
								} finally {
									setIsSubmitting(false);
								}
							}}
						>
							<button
								type='submit'
								disabled={isSubmitting}
								className='text-zinc-600 hover:text-zinc-900 font-light transition-colors duration-200 text-sm underline disabled:opacity-50 disabled:cursor-not-allowed'
							>
								後で設定する
							</button>
						</form>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
