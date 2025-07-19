import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import TodoApp from "@/components/TodoApp"; // クライアントコンポーネントとして分離

export const runtime = "edge";

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

	// ユーザーのメタデータから追加情報を取得
	const userProfile = {
		id: user.id,
		email: user.email || "",
		username: user.user_metadata?.username || "",
		displayName: user.user_metadata?.display_name || user.email,
		avatarUrl: user.user_metadata?.avatar_url || "",
	};

	return <TodoApp user={userProfile} />;

}
