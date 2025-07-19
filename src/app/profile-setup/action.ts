"use server";

export const runtime = "edge";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function updateProfile(formData: FormData) {
	const supabase = await createClient();

	// 現在のユーザーを取得
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		redirect("/login");
		return;
	}

	const username = formData.get("username") as string;
	const displayName = formData.get("displayName") as string;
	const avatar = formData.get("avatar") as File;

	let avatarUrl = "";

	if (avatar && avatar.size > 0) {
		try {
			const fileExt = avatar.name.split(".").pop();
			const fileName = `${username}-${Date.now()}.${fileExt}`;
			const filePath = `${fileName}`;

			//Supabase Storageにアップロード処理
			const { error: uploadError } = await supabase.storage
				.from("avatars")
				.upload(filePath, avatar, {
					cacheControl: "3600",
					upsert: false, //同じファイルがある場合は失敗とする
				});
			if (uploadError) {
				console.error("アップロードエラー:", uploadError);
				redirect("/error");
				return;
			}
			//アップロードしたファイルのURLを取得
			const { data: urlData } = supabase.storage
				.from("avatars")
				.getPublicUrl(filePath);
			avatarUrl = urlData.publicUrl;
		} catch (error) {
			console.error("アップロードエラー:", error);
			redirect("/error");
			return;
		}
	}
	// プロフィール情報を更新
	const { error: updateError } = await supabase.auth.updateUser({
		data: {
			username: username,
			display_name: displayName || username,
			avatar_url: avatarUrl,
		},
	});

	if (updateError) {
		console.error("プロフィール更新エラー:", updateError);
		redirect("/error");
		return;
	}

	revalidatePath("/", "layout");
	redirect("/");
}
