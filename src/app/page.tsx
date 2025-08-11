import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";


export default async function Home() {
	const supabase = await createClient();

	// ユーザー情報を取得
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	// 未認証の場合はランディングページにリダイレクト
	if (error || !user) {
		redirect("/landing");
	}

	// 認証済みの場合はタスクページにリダイレクト
	redirect("/tasks");
}
