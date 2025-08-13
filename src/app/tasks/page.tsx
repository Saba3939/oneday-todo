import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TodoApp from "@/components/TodoApp";
import AuthSuccessNotification from "@/components/AuthSuccessNotification";
import UserDebugInfo from "@/components/UserDebugInfo";

export default async function TasksPage() {
	const supabase = await createClient();

	// ユーザー情報を取得
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	// 認証状態をチェック
	const isAuthenticated = !error && !!user;
	
	if (isAuthenticated) {
		// 認証済みユーザーの場合
		
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
		const lastLoginAt = profileRow?.last_login_at || null;

		return (
			<>
				<AuthSuccessNotification />
				<TodoApp user={userProfile} lastLoginAt={lastLoginAt} isGuest={false} />
				<UserDebugInfo />
			</>
		);
	} else {
		// ゲストユーザーの場合
		return (
			<TodoApp isGuest={true} />
		);
	}
}