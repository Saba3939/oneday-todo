"use server";

export const runtime = "edge";

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
		redirect("/error");
	}

	const { error } = await supabase.auth.signUp({
		email: data.email,
		password: data.password,
	});

	if (error) {
		redirect("/error");
	}

	revalidatePath("/", "layout");
	redirect("/profile-setup");
}
