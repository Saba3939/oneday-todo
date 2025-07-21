import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	const error = searchParams.get("error");
	const error_description = searchParams.get("error_description");

	// エラーがある場合はログインページにリダイレクト
	if (error) {
		return NextResponse.redirect(
			`${origin}/login?error=${error}&description=${encodeURIComponent(
				error_description || ""
			)}`
		);
	}

	if (code) {
		const supabase = await createClient();

		try {
			const { data, error: exchangeError } =
				await supabase.auth.exchangeCodeForSession(code);

			if (exchangeError) {
				return NextResponse.redirect(
					`${origin}/login?error=session_exchange_failed&message=${encodeURIComponent(
						exchangeError.message
					)}`
				);
			}

			if (data.user) {
				const userId = data.user.id;
				const googleAvatarUrl = data.user.user_metadata?.avatar_url || "";

				// profilesテーブルから独自アバターを取得
				const { data: profileData } = await supabase
					.from("profiles")
					.select("avatar_url")
					.eq("id", userId)
					.single();

				const customAvatarUrl = profileData?.avatar_url || "";

				// GoogleアバターURL判定
				const isGoogleAvatar = googleAvatarUrl.startsWith(
					"https://lh3.googleusercontent.com/"
				);
				// 独自アバターURL判定（Supabase Storageのパス）
				const isCustomAvatar =
					customAvatarUrl.startsWith("/storage/v1/object/public/avatars/") ||
					customAvatarUrl.includes("/storage/v1/object/public/avatars/");

				// Googleアバターなら独自アバターで上書き
				if (
					isGoogleAvatar &&
					isCustomAvatar &&
					googleAvatarUrl !== customAvatarUrl
				) {
					await supabase.auth.updateUser({
						data: {
							avatar_url: customAvatarUrl,
						},
					});
				}

				// --- Google新規サインアップ時、profiles.avatar_urlが空ならGoogleアバターをコピー ---
				if (isGoogleAvatar && !customAvatarUrl) {
					await supabase.from("profiles").upsert(
						{
							id: userId,
							avatar_url: googleAvatarUrl,
						},
						{ onConflict: "id" }
					);
				}
				// プロフィールが設定済みかチェック
				const hasProfile =
					data.user.user_metadata?.username ||
					data.user.user_metadata?.display_name;

				// プロフィールが未設定の場合はプロフィール設定ページへ
				if (!hasProfile) {
					return NextResponse.redirect(`${origin}/profile-setup`);
				} else {
					return NextResponse.redirect(`${origin}/`);
				}
			}
		} catch (error) {
			return NextResponse.redirect(
				`${origin}/login?error=auth_failed&message=${encodeURIComponent(
					String(error)
				)}`
			);
		}
	}

	// コードがない場合はログインページにリダイレクト
	return NextResponse.redirect(`${origin}/login?error=no_code`);
}
