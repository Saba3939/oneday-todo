import type { NextConfig } from "next";
import nextPWA from "next-pwa";

const withPWA = nextPWA({
	dest: "public",
	register: true,
	skipWaiting: true,
});

const nextConfig = withPWA({
	// CloudflareのOpenNextで画像最適化を無効化
	images: {
		unoptimized: true,
	},
	trailingSlash: true,
	// Cloudflareでの画像最適化を無効化
	images: {
		unoptimized: true,
	},
	/* config options here */
	
	// 静的ファイルの最適化設定
	assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
	
	// 静的ファイルのヘッダー設定
	async headers() {
		return [
			{
				source: '/:path*\.(png|jpg|jpeg|gif|svg|webp|ico)',
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=86400',
					},
				],
			},
		];
	},

	webpack: (config) => {
		// Exclude Supabase functions from the build process
		config.watchOptions = {
			...config.watchOptions,
			ignored: ["**/supabase/functions/**"],
		};
		return config;
	},
}) as NextConfig;
export default nextConfig;
