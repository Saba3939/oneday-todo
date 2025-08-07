"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
	const supabase = await createClient();

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const data = {
		email: formData.get("email") as string,
		password: formData.get("password") as string,
		confirmPassword: formData.get("confirmPassword") as string,
	};

	// パスワードの確認
	if (data.password !== data.confirmPassword) {
		redirect(
			"/signup?error=password_mismatch&message=" +
				encodeURIComponent("パスワードが一致しません")
		);
	}

	const { data: signUpData, error } = await supabase.auth.signUp({
		email: data.email,
		password: data.password,
	});

	if (error) {
		// ユーザー側のエラー（バリデーションエラーなど）はサインアップページで表示
		if (
			error.message.includes("Password") ||
			error.message.includes("password") ||
			error.message.includes("パスワード") ||
			error.message.includes("weak") ||
			error.message.includes("短") ||
			error.message.includes("Email") ||
			error.message.includes("email") ||
			error.message.includes("メール") ||
			error.message.includes("invalid") ||
			error.message.includes("format") ||
			error.message.includes("already") ||
			error.message.includes("exists") ||
			error.message.includes("既に")
		) {
			redirect(
				"/signup?error=validation_error&message=" +
					encodeURIComponent(error.message)
			);
		} else {
			// システムエラーはエラーページにリダイレクト
			redirect(
				"/error?error=signup_failed&message=" +
					encodeURIComponent(error.message)
			);
		}
	}

	// メール確認が必要な場合の処理
	if (signUpData.user && !signUpData.session) {
		// メール確認が必要な場合
		redirect(
			"/login?message=" +
				encodeURIComponent("確認メールを送信しました。メールをご確認ください。")
		);
	}

	revalidatePath("/", "layout");
	redirect("/profile-setup");
}
