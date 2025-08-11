import { Metadata } from "next";

export const metadata: Metadata = {
	title: "OneDay Todo - 一日に集中できるタスク管理アプリ",
	description: "毎日のタスクを効率的に管理し、集中力を高めて生産性を向上させましょう。ドラッグ&ドロップでタスクを簡単に並び替え、未完了のタスクは翌日に自動で引き継がれます。",
	keywords: "タスク管理, Todo, 生産性, ポモドーロ, PWA, 日本語",
	openGraph: {
		title: "OneDay Todo - 一日に集中できるタスク管理アプリ",
		description: "毎日のタスクを効率的に管理し、集中力を高めて生産性を向上させましょう。",
		type: "website",
		locale: "ja_JP",
	},
};

export default function LandingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}