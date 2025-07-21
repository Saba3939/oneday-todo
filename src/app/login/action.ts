"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
	const supabase = await createClient();

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const data = {
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	};

	const { error } = await supabase.auth.signInWithPassword(data);

	if (error) {
		redirect("/error");
	}

	// ログイン成功後、ユーザー情報を取得してプロフィール状態をチェック
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		redirect("/error");
	}

	// --- ここからlast_login_atの更新 ---
	// await supabase.from("profiles").update({
	// 	last_login_at: new Date().toISOString(),
	// }).eq("id", user.id);
	// --- ここまでlast_login_atの更新 ---

	// プロフィールが設定済みかチェック
	const hasProfile =
		user.user_metadata?.username || user.user_metadata?.display_name;

	revalidatePath("/", "layout");

	// プロフィールが未設定の場合のみプロフィール設定ページにリダイレクト
	if (!hasProfile) {
		redirect("/profile-setup");
	} else {
		redirect("/");
	}
}
