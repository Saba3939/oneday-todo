import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TodoApp from "@/components/TodoApp"; // クライアントコンポーネントとして分離

export default async function Home() {
	const supabase = await createClient();

	// ユーザー情報を取得
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	// 未認証の場合はログインページにリダイレクト
	if (error || !user) {
		redirect("/login");
	}

	// プロフィールが設定済みかチェック
	const hasProfile =
		user.user_metadata?.username || user.user_metadata?.display_name;

	if (!hasProfile) {
		redirect("/profile-setup");
	}

	// ユーザーのメタデータから追加情報を取得
	const userProfile = {
		id: user.id,
		email: user.email || "",
		username: user.user_metadata?.username || "",
		displayName: user.user_metadata?.display_name || user.email || "",
		avatarUrl: user.user_metadata?.avatar_url || "",
	};

	// profilesテーブルからlast_login_atを取得
	const { data: profileRow } = await supabase
		.from("profiles")
		.select("last_login_at")
		.eq("id", user.id)
		.single();
	console.log(profileRow);
	const lastLoginAt = profileRow?.last_login_at || null;

	return <TodoApp user={userProfile} lastLoginAt={lastLoginAt} />;
}
