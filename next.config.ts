import type { NextConfig } from "next";
import nextPWA from "next-pwa";

const withPWA = nextPWA({
	dest: "public",
	register: true,
	skipWaiting: true,
});

const nextConfig = withPWA({
	trailingSlash: true,
	/* config options here */
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
