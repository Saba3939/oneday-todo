"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// アバター画像の削除関数
async function deleteOldAvatar(
	supabase: Awaited<ReturnType<typeof createClient>>,
	oldAvatarUrl: string
) {
	if (!oldAvatarUrl) return;

	try {
		// URLからファイルパスを抽出
		const url = new URL(oldAvatarUrl);
		const pathMatch = url.pathname.match(
			/\/storage\/v1\/object\/public\/avatars\/(.+)$/
		);

		if (pathMatch) {
			const filePath = pathMatch[1];
			await supabase.storage.from("avatars").remove([filePath]);
		}
	} catch {
		// 古いアバター削除に失敗しても処理を継続
		// エラーが発生しても処理を継続
	}
}

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

	let avatarUrl = user.user_metadata?.avatar_url || "";

	// アバター画像のアップロード処理
	if (avatar && avatar.size > 0) {
		try {
			// 古いアバター画像を削除
			if (user.user_metadata?.avatar_url) {
				await deleteOldAvatar(supabase, user.user_metadata.avatar_url);
			}

			// ファイル名を生成（ユーザーIDとタイムスタンプを使用）
			const fileExt = avatar.name.split(".").pop();
			const fileName = `${user.id}-${Date.now()}.${fileExt}`;
			const filePath = `avatars/${fileName}`;

			// ファイルサイズとタイプの検証
			const maxSize = 5 * 1024 * 1024; // 5MB
			const allowedTypes = [
				"image/jpeg",
				"image/png",
				"image/gif",
				"image/webp",
			];

			if (avatar.size > maxSize) {
				redirect("/error?message=" + encodeURIComponent("ファイルサイズが大きすぎます"));
				return;
			}

			if (!allowedTypes.includes(avatar.type)) {
				redirect("/error?message=" + encodeURIComponent("許可されていないファイル形式です"));
				return;
			}

			// Supabase Storageにファイルをアップロード
			const { error: uploadError } = await supabase.storage
				.from("avatars")
				.upload(filePath, avatar, {
					cacheControl: "3600",
					upsert: false,
				});

			if (uploadError) {
				redirect("/error?message=" + encodeURIComponent("アバターのアップロードに失敗しました"));
				return;
			}

			// アップロードしたファイルのパブリックURLを取得
			const { data: urlData } = supabase.storage
				.from("avatars")
				.getPublicUrl(filePath);

			avatarUrl = urlData.publicUrl;
		} catch {
			redirect("/error?message=" + encodeURIComponent("アバターの処理中にエラーが発生しました"));
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

	const { error: profileError } = await supabase.from("profiles").upsert({
		id: user.id,
		username: username,
		display_name: displayName || username,
		avatar_url: avatarUrl,
		is_premium: false,
	});

	if (updateError || profileError) {
		redirect("/error?message=" + encodeURIComponent("プロフィールの更新に失敗しました"));
		return;
	}

	revalidatePath("/", "layout");
	redirect("/");
}

// プロフィール設定をスキップする関数
export async function skipProfileSetup() {
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

	// 最低限のプロフィール情報を設定（メールアドレスから生成）
	const email = user.email || "";
	const username = email.split("@")[0]; // メールアドレスの@より前の部分をusernameとして使用
	const displayName = username;

	// プロフィール情報を更新
	const { error: updateError } = await supabase.auth.updateUser({
		data: {
			username: username,
			display_name: displayName,
		},
	});

	if (updateError) {
		redirect("/error?message=" + encodeURIComponent("プロフィールの更新に失敗しました"));
		return;
	}

	revalidatePath("/", "layout");
	redirect("/");
}
