import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
	),
	title: "OneDay Todo",
	description: "一日に集中できるタスク管理アプリ",
	openGraph: {
		title: "OneDay Todo",
		description: "一日に集中できるタスク管理アプリ",
		type: "website",
		locale: "ja_JP",
		siteName: "OneDay Todo",
		images: [
			{
				url: "/og-image-padded.png",
				width: 1200,
				height: 630,
				alt: "OneDay Todo - 一日に集中できるタスク管理アプリ",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "OneDay Todo",
		description: "一日に集中できるタスク管理アプリ",
		images: ["/og-image-padded.png"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='ja'>
			<head>
				<link rel='manifest' href='/manifest.json' />
				<link rel='apple-touch-icon' href='/icon512_rounded.png' />
				<meta name='theme-color' content='#ffffff' />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
