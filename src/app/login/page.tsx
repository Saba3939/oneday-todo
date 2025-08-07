"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Lock, LogIn, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { login } from "./action";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";

export default function Login() {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const supabase = createClient();

	// URLパラメータからエラーを取得
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const errorParam = urlParams.get("error");
		const messageParam = urlParams.get("message");
		if (errorParam) {
			setError(messageParam || errorParam);
		}
	}, []);

	const handleGoogleLogin = async () => {
		try {
			setLoading(true);
			setError(null);

			const { error: authError } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
				},
			});

			if (authError) {
				setError("Googleログインに失敗しました: " + authError.message);
			}
		} catch (err) {
			console.error("Googleログインエラー:", err);
			setError("予期しないエラーが発生しました");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-zinc-50 to-white flex items-center justify-center p-6'>
			<Card className='w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden'>
				<CardHeader className='text-center pt-12'>
					<div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-zinc-900 to-zinc-700 rounded-full mb-6 shadow-lg mx-auto'>
						<LogIn className='w-10 h-10 text-white' />
					</div>
					<CardTitle className='text-4xl font-extralight text-zinc-900 tracking-wide mb-2'>
						ログイン
					</CardTitle>
					<p className='text-zinc-600 font-light text-lg'>
						アカウントにサインイン
					</p>
				</CardHeader>
				<CardContent className='p-8'>
					{error && (
						<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
							<p className='text-sm text-red-600'>{error}</p>
						</div>
					)}

					<form action={login} className='space-y-6'>
						<div>
							<Label htmlFor='email' className='sr-only'>
								メールアドレス
							</Label>
							<div className='relative'>
								<Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400' />
								<Input
									id='email'
									type='email'
									name='email'
									placeholder='メールアドレス'
									required
									className='w-full pl-10 pr-4 py-3 border border-zinc-200 bg-zinc-50/50 text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-0 focus-visible:ring-0 focus:outline-none transition-all duration-300 font-light'
								/>
							</div>
						</div>

						<div>
							<Label htmlFor='password' className='sr-only'>
								パスワード
							</Label>
							<div className='relative'>
								<Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400' />
								<Input
									id='password'
									type='password'
									placeholder='パスワード'
									name='password'
									required
									className='w-full pl-10 pr-4 py-3 border border-zinc-200 bg-zinc-50/50 text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-0 focus-visible:ring-0 focus:outline-none transition-all duration-300 font-light'
								/>
							</div>
						</div>

						<Button
							type='submit'
							className='w-full bg-gradient-to-r from-zinc-900 to-zinc-700 hover:from-zinc-800 hover:to-zinc-600 text-white px-8 py-4 font-light tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl text-lg'
						>
							ログイン
						</Button>
					</form>

					<div className='my-6 flex items-center'>
						<div className='flex-1 border-t border-zinc-200'></div>
						<span className='px-4 text-sm text-zinc-500 font-light'>
							または
						</span>
						<div className='flex-1 border-t border-zinc-200'></div>
					</div>

					<Button
						onClick={handleGoogleLogin}
						disabled={loading}
						variant='outline'
						className='w-full border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 px-8 py-4 font-light tracking-wide transition-all duration-300 shadow-sm hover:shadow-md text-lg'
					>
						<FcGoogle className='w-5 h-5 mr-3' />
						{loading ? "処理中..." : "Googleでログイン"}
					</Button>

					<div className='mt-8 text-center text-sm'>
						<Link
							href='#'
							className='text-zinc-600 hover:text-zinc-900 font-light transition-colors duration-200'
						>
							パスワードをお忘れですか？
						</Link>
						<p className='mt-4 text-zinc-600 font-light'>
							アカウントをお持ちではありませんか？
							<Link
								href='/signup'
								className='text-zinc-900 font-medium hover:underline'
							>
								サインアップ
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
