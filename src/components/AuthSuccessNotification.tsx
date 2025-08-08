"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { CheckCircle, X } from "lucide-react";

function AuthSuccessNotificationInner() {
	const searchParams = useSearchParams();
	const [isVisible, setIsVisible] = useState(false);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const authSuccess = searchParams.get("auth_success");
		const messageParam = searchParams.get("message");

		if (authSuccess === "true" && messageParam) {
			setMessage(decodeURIComponent(messageParam));
			setIsVisible(true);

			// URLパラメータをクリーンアップ（オプション）
			const url = new URL(window.location.href);
			url.searchParams.delete("auth_success");
			url.searchParams.delete("message");
			window.history.replaceState({}, document.title, url.toString());

			// 5秒後に自動で閉じる
			const timer = setTimeout(() => {
				setIsVisible(false);
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [searchParams]);

	if (!isVisible) return null;

	return (
		<div className='fixed top-4 right-4 z-50 max-w-sm w-full'>
			<div className='bg-white border border-green-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-top duration-300'>
				<div className='flex items-start space-x-3'>
					<div className='flex-shrink-0'>
						<CheckCircle className='w-6 h-6 text-green-600' />
					</div>
					<div className='flex-1'>
						<p className='text-sm font-medium text-green-800'>認証成功</p>
						<p className='text-sm text-green-700 mt-1'>{message}</p>
					</div>
					<button
						onClick={() => setIsVisible(false)}
						className='flex-shrink-0 text-green-400 hover:text-green-600 transition-colors'
					>
						<X className='w-5 h-5' />
					</button>
				</div>
			</div>
		</div>
	);
}

export default function AuthSuccessNotification() {
	return (
		<Suspense fallback={null}>
			<AuthSuccessNotificationInner />
		</Suspense>
	);
}
