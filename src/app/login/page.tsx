"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		if (email === "test@example.com" && password === "password") {
			// Simulate successful login
			console.log("ログイン成功！");
			// Redirect to main page or dashboard
			// router.push('/')
		} else {
			setError("メールアドレスまたはパスワードが間違っています。");
		}
		setLoading(false);
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
					<form onSubmit={handleLogin} className='space-y-6'>
						{/* Email Input */}
						<div>
							<Label htmlFor='email' className='sr-only'>
								メールアドレス
							</Label>
							<div className='relative'>
								<Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400' />
								<Input
									id='email'
									type='email'
									placeholder='メールアドレス'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className='w-full pl-10 pr-4 py-3 border border-zinc-200  bg-zinc-50/50 text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-0 focus-visible:ring-0 focus:outline-none transition-all duration-300 font-light'
								/>
							</div>
						</div>

						{/* Password Input */}
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
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className='w-full pl-10 pr-4 py-3 border border-zinc-200  bg-zinc-50/50 text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-0 focus-visible:ring-0 focus:outline-none transition-all duration-300 font-light'
								/>
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<p className='text-red-500 text-sm text-center'>{error}</p>
						)}

						{/* Login Button */}
						<Button
							type='submit'
							className='w-full bg-gradient-to-r from-zinc-900 to-zinc-700 hover:from-zinc-800 hover:to-zinc-600 text-white px-8 py-4 font-light tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl text-lg'
							disabled={loading}
						>
							{loading ? "ログイン中..." : "ログイン"}
						</Button>
						<Button
							type='submit'
							className='w-full  bg-gradient-to-r from-zinc-900 to-zinc-700 hover:from-zinc-800 hover:to-zinc-600 text-white px-8 py-4 font-light tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl text-lg'
							disabled={loading}
						>
							<FcGoogle className='w-4 h-4 mr-2' />
							{loading ? "ログイン中..." : "Googleでログイン"}
						</Button>
					</form>

					{/* Forgot Password / Sign Up Links */}
					<div className='mt-8 text-center text-sm'>
						<Link
							href='#'
							className='text-zinc-600 hover:text-zinc-900 font-light transition-colors duration-200'
						>
							パスワードをお忘れですか？
						</Link>
						<p className='mt-4 text-zinc-600 font-light'>
							アカウントをお持ちではありませんか？{" "}
							<Link
								href='#'
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
