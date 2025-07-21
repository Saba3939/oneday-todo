import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		return NextResponse.json({ error: "ユーザー取得エラー" }, { status: 401 });
	}
	// UTCの現在時刻で保存
	await supabase
		.from("profiles")
		.update({
			last_login_at: new Date().toISOString(),
		})
		.eq("id", user.id);
	return NextResponse.json({ ok: true });
}
