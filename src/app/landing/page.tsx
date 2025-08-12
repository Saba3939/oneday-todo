import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
	CheckCircle, 
	Clock, 
	GripVertical, 
	Smartphone,
	Calendar,
	Archive,
	ArrowRight
} from "lucide-react";
import Link from "next/link";

import { createClient } from "@/utils/supabase/server";

export default async function LandingPage() {
	const supabase = await createClient();

	// ユーザー情報を取得
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const isAuthenticated = !!user;

	return (
		<main className="min-h-screen bg-white">
			{/* ヒーローセクション */}
			<section className="relative px-4 py-20 text-center border-b border-gray-100">
				<div className="mx-auto max-w-4xl">
					<div className="mb-8">
						<div className="flex justify-center mb-4">
							<img 
								src="/oneday-todo.png" 
								alt="OneDay Todo アイコン" 
								className="size-32  md:size-40 rounded-lg"
							/>
						</div>
						<h1 className="mb-6 text-4xl font-bold tracking-tight text-black md:text-6xl">
							OneDay Todo
						</h1>
						<p className="mx-auto max-w-2xl text-xl text-gray-600 md:text-2xl">
							一日に集中できるタスク管理アプリ
						</p>
					</div>
					
					<p className="mx-auto mb-8 max-w-3xl text-lg text-gray-700 leading-relaxed">
						毎日のタスクを効率的に管理し、集中力を高めて生産性を向上させましょう。
						ドラッグ&ドロップでタスクを簡単に並び替え、必要なタスクを選択して翌日に引き継げます。
					</p>

					<div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
						{isAuthenticated ? (
							<>
								<Link href="/tasks">
									<Button size="lg" className="w-full sm:w-auto bg-black text-white hover:bg-gray-800">
										タスクページに戻る
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</Link>
								{user && (
									<div className="flex items-center justify-center text-gray-600">
										ようこそ、{user.user_metadata?.display_name || user.email}さん
									</div>
								)}
							</>
						) : (
							<>
								<Link href="/tasks">
									<Button size="lg" className="w-full sm:w-auto bg-gray-600 text-white hover:bg-gray-700">
										ゲストで試してみる
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</Link>
								<Link href="/signup">
									<Button size="lg" className="w-full sm:w-auto bg-black text-white hover:bg-gray-800">
										無料で始める
									</Button>
								</Link>
								<Link href="/login">
									<Button variant="outline" size="lg" className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50">
										ログイン
									</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			</section>

			{/* 機能紹介セクション */}
			<section className="px-4 py-16 bg-gray-50">
				<div className="mx-auto max-w-6xl">
					<div className="mb-16 text-center">
						<h2 className="mb-4 text-3xl font-bold text-black md:text-4xl">
							主な機能
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-gray-600">
							シンプルで使いやすい機能で、あなたの日常をサポートします
						</p>
					</div>

					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{/* ドラッグ&ドロップ */}
						<Card className="group hover:shadow-lg transition-shadow bg-white border-gray-200">
							<CardContent className="p-6">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
									<GripVertical className="h-6 w-6 text-black" />
								</div>
								<h3 className="mb-2 text-xl font-semibold text-black">
									ドラッグ&ドロップ
								</h3>
								<p className="text-gray-600">
									タスクを直感的にドラッグ&ドロップで並び替え。優先順位の調整が簡単です。
								</p>
							</CardContent>
						</Card>

						{/* タスク引き継ぎ */}
						<Card className="group hover:shadow-lg transition-shadow bg-white border-gray-200">
							<CardContent className="p-6">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
									<Calendar className="h-6 w-6 text-black" />
								</div>
								<h3 className="mb-2 text-xl font-semibold text-black">
									選択的引き継ぎ
								</h3>
								<p className="text-gray-600">
									前日の未完了タスクから必要なものを選んで翌日に引き継ぎ。柔軟にタスクを管理できます。
								</p>
							</CardContent>
						</Card>

						{/* 削除済みタスク管理 */}
						<Card className="group hover:shadow-lg transition-shadow bg-white border-gray-200">
							<CardContent className="p-6">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
									<Archive className="h-6 w-6 text-black" />
								</div>
								<h3 className="mb-2 text-xl font-semibold text-black">
									削除済みタスク管理
								</h3>
								<p className="text-gray-600">
									削除したタスクを一時的に保管し、必要に応じて復元することができます。
								</p>
							</CardContent>
						</Card>

						{/* PWA対応 */}
						<Card className="group hover:shadow-lg transition-shadow bg-white border-gray-200">
							<CardContent className="p-6">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
									<Smartphone className="h-6 w-6 text-black" />
								</div>
								<h3 className="mb-2 text-xl font-semibold text-black">
									PWA対応
								</h3>
								<p className="text-gray-600">
									スマートフォンにアプリとしてインストール可能。オフラインでも利用できます。
								</p>
							</CardContent>
						</Card>

						{/* シンプルなUI */}
						<Card className="group hover:shadow-lg transition-shadow bg-white border-gray-200">
							<CardContent className="p-6">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
									<CheckCircle className="h-6 w-6 text-black" />
								</div>
								<h3 className="mb-2 text-xl font-semibold text-black">
									シンプルなUI
								</h3>
								<p className="text-gray-600">
									直感的で使いやすいインターフェース。誰でもすぐに使い始められます。
								</p>
							</CardContent>
						</Card>

						{/* 日本語対応 */}
						<Card className="group hover:shadow-lg transition-shadow bg-white border-gray-200">
							<CardContent className="p-6">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
									<Clock className="h-6 w-6 text-black" />
								</div>
								<h3 className="mb-2 text-xl font-semibold text-black">
									日本時間対応
								</h3>
								<p className="text-gray-600">
									日本時間（JST）に完全対応。日本のライフスタイルに合わせて設計されています。
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* 使い方セクション */}
			<section className="px-4 py-16 bg-white border-t border-gray-100">
				<div className="mx-auto max-w-4xl">
					<div className="mb-16 text-center">
						<h2 className="mb-4 text-3xl font-bold text-black md:text-4xl">
							使い方はとっても簡単
						</h2>
						<p className="mx-auto max-w-2xl text-lg text-gray-600">
							3つのステップですぐに始められます
						</p>
					</div>

					<div className="grid gap-12 md:grid-cols-3">
						{/* ステップ1 */}
						<div className="text-center">
							<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl font-bold text-white">
								1
							</div>
							<h3 className="mb-3 text-xl font-semibold text-black">
								{isAuthenticated ? "ログイン完了" : "アカウント作成"}
							</h3>
							<p className="text-gray-600">
								{isAuthenticated ? "既にログインされています。すぐにタスク管理を開始できます。" : "メールアドレスで簡単にアカウントを作成。すぐに使い始められます。"}
							</p>
						</div>

						{/* ステップ2 */}
						<div className="text-center">
							<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-700 text-2xl font-bold text-white">
								2
							</div>
							<h3 className="mb-3 text-xl font-semibold text-black">
								タスクを追加
							</h3>
							<p className="text-gray-600">
								今日やりたいことを入力してタスクを追加。ドラッグで順番を変更できます。
							</p>
						</div>

						{/* ステップ3 */}
						<div className="text-center">
							<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-500 text-2xl font-bold text-white">
								3
							</div>
							<h3 className="mb-3 text-xl font-semibold text-black">
								集中して実行
							</h3>
							<p className="text-gray-600">
								タスクに集中して取り組み、完了したものにチェックを入れて達成感を味わいましょう。
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTAセクション */}
			<section className="px-4 py-20 bg-gray-50">
				<div className="mx-auto max-w-4xl text-center">
					<div className="rounded-3xl bg-black p-12 text-white shadow-xl">
						<h2 className="mb-6 text-3xl font-bold md:text-4xl">
							{isAuthenticated ? "今日のタスクを管理しましょう" : "今すぐ始めて、生産性を向上させましょう"}
						</h2>
						<p className="mb-8 text-lg text-gray-300">
							{isAuthenticated ? "認証済みです。タスクページに戻って今日のタスクを管理しましょう。" : "完全無料でご利用いただけます。アカウント作成後すぐに全ての機能をお使いいただけます。"}
						</p>
						
						<div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
							{isAuthenticated ? (
								<Link href="/tasks">
									<Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-black hover:bg-gray-100">
										タスクページに移動
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</Link>
							) : (
								<>
									<Link href="/signup">
										<Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-black hover:bg-gray-100">
											無料でアカウント作成
											<ArrowRight className="ml-2 h-4 w-4" />
										</Button>
									</Link>
									<Link href="/login">
										<Button size="lg" variant="outline" className="w-full sm:w-auto border-white bg-black text-white hover:bg-white hover:text-black">
											既にアカウントをお持ちの方
										</Button>
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* フッター */}
			<footer className="px-4 py-8 text-center bg-white border-t border-gray-100">
				<div className="mx-auto max-w-4xl">
					<p className="text-gray-600">&copy; 2024 OneDay Todo. All rights reserved.</p>
				</div>
			</footer>
		</main>
	);
}
