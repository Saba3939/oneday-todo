import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const token_hash = searchParams.get("token_hash");
	const type = searchParams.get("type") as EmailOtpType | null;
	const next = searchParams.get("next") ?? "/";

	if (token_hash && type) {
		const supabase = await createClient();

		const { error } = await supabase.auth.verifyOtp({
			type,
			token_hash,
		});
		if (!error) {
			// 認証成功時に成功メッセージ付きでリダイレクト
			const successUrl = new URL(next, request.url);
			successUrl.searchParams.set("auth_success", "true");
			successUrl.searchParams.set(
				"message",
				encodeURIComponent("メール認証が完了しました！")
			);
			redirect(successUrl.toString());
		}
	}

	// redirect the user to an error page with some instructions
	redirect(
		"/error?error=auth_confirm_failed&message=" +
			encodeURIComponent("認証リンクが無効または期限切れです")
	);
}
