# OneDay Todo（一日に集中できるタスク管理アプリ）

日本語対応のタスク管理アプリケーション。1日に集中してタスクを完了することを目的とした、シンプルで効率的なTodoアプリです。

## 主な機能

- **日次タスク管理**: 日付ベースでタスクを整理
- **ドラッグ&ドロップ**: タスクの順序を直感的に変更
- **前日タスク引き継ぎ**: 未完了タスクを翌日に簡単にインポート
- **ポモドーロタイマー統合**: 集中作業をサポート
- **PWA対応**: スマートフォンやデスクトップでアプリライクな体験
- **リアルタイム同期**: Supabaseによる即座なデータ同期

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイリング**: Tailwind CSS, shadcn/ui
- **バックエンド**: Supabase (PostgreSQL + Auth)
- **デプロイ**: Cloudflare Pages
- **PWA**: next-pwa

## 開発環境のセットアップ

### 必要な環境変数

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 開発サーバーの起動

```bash
npm install
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## 利用可能なコマンド

- `npm run dev` - 開発サーバーを起動（Turbopack使用）
- `npm run build` - プロダクション用にビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - ESLintによるコードチェック
- `npm run preview` - Cloudflare用プレビュー
- `npm run deploy` - Cloudflareにデプロイ

## アーキテクチャ

### データベース構造
- **tasks**: ユーザーのタスクデータ（内容、完了状態、順序など）
- **認証**: Supabase Authによるユーザー管理

### 主要コンポーネント
- `src/components/TodoApp.tsx` - メインのTodo機能
- `src/components/ui/` - UI コンポーネント
- `src/lib/tasks.ts` - サーバーアクション
- `src/utils/supabase/` - Supabase設定

## デプロイメント

このアプリケーションはCloudflare Pagesでホストされ、PWAとして利用可能です。

## ライセンス

MIT