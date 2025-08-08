"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

function ErrorPageInner() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");
	const message = searchParams.get("message");

	return (
		<div className='min-h-screen bg-gradient-to-br from-zinc-50 to-white flex items-center justify-center p-6'>
			<Card className='w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden'>
				<CardHeader className='text-center pt-12'>
					<div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-6 shadow-lg mx-auto'>
						<AlertCircle className='w-10 h-10 text-white' />
					</div>
					<CardTitle className='text-4xl font-extralight text-zinc-900 tracking-wide mb-2'>
						エラーが発生しました
					</CardTitle>
					<p className='text-zinc-600 font-light text-lg'>申し訳ございません</p>
				</CardHeader>
				<CardContent className='p-8'>
					{(error || message) && (
						<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
							<p className='text-sm text-red-600'>
								{message || error || "不明なエラーが発生しました"}
							</p>
						</div>
					)}
					<div className='space-y-4'>
						<Link href='/login' className='block'>
							<Button className='w-full bg-gradient-to-r from-zinc-900 to-zinc-700 hover:from-zinc-800 hover:to-zinc-600 text-white px-8 py-4 font-light tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl text-lg'>
								ログインページに戻る
							</Button>
						</Link>
						<Link href='/signup' className='block'>
							<Button
								variant='outline'
								className='w-full border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 px-8 py-4 font-light tracking-wide transition-all duration-300 shadow-sm hover:shadow-md text-lg'
							>
								新規登録
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function ErrorPage() {
	return (
		<Suspense
			fallback={
				<div className='min-h-screen bg-gradient-to-br from-zinc-50 to-white flex items-center justify-center p-6'>
					<Card className='w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden'>
						<CardHeader className='text-center pt-12'>
							<div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-6 shadow-lg mx-auto'>
								<AlertCircle className='w-10 h-10 text-white' />
							</div>
							<CardTitle className='text-4xl font-extralight text-zinc-900 tracking-wide mb-2'>
								エラーが発生しました
							</CardTitle>
							<p className='text-zinc-600 font-light text-lg'>
								申し訳ございません
							</p>
						</CardHeader>
						<CardContent className='p-8'>
							<div className='space-y-4'>
								<Link href='/login' className='block'>
									<Button className='w-full bg-gradient-to-r from-zinc-900 to-zinc-700 hover:from-zinc-800 hover:to-zinc-600 text-white px-8 py-4 font-light tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl text-lg'>
										ログインページに戻る
									</Button>
								</Link>
								<Link href='/signup' className='block'>
									<Button
										variant='outline'
										className='w-full border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 px-8 py-4 font-light tracking-wide transition-all duration-300 shadow-sm hover:shadow-md text-lg'
									>
										新規登録
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			}
		>
			<ErrorPageInner />
		</Suspense>
	);
}
