import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
	// POST以外のリクエストは弾く
	if (req.method !== "POST") {
		return new Response("Method Not Allowed", {
			status: 405,
			headers: corsHeaders,
		});
	}

	try {
		// RLSをバイパスするため、必ずservice_roleキーを使う
		// 環境変数に `SERVICE_ROLE_KEY` として設定しておく
		const supabaseAdmin = createClient(
			Deno.env.get("SUPABASE_URL") ?? "",
			Deno.env.get("SERVICE_ROLE_KEY") ?? ""
		);

		// `tasks`テーブルから、タスクを全て削除（未完了のタスクのみ）
		const { error } = await supabaseAdmin
			.from("tasks")
			.delete()
			.neq("id", -1); // 全件削除のために常に真となる条件を使用

		if (error) {
			throw error;
		}

		return new Response(
			JSON.stringify({ message: "Uncompleted tasks have been reset." }),
			{
				headers: { ...corsHeaders, "Content-Type": "application/json" },
				status: 200,
			}
		);
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			headers: { ...corsHeaders, "Content-Type": "application/json" },
			status: 500,
		});
	}
});
