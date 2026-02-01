# 自動設定完了ガイド

## ✅ 完了した設定

1. ✅ Supabase環境変数をVercelに設定
   - `VITE_SUPABASE_URL`: `https://miyqdbmatdwbnrzfnnbo.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: 設定済み
2. ✅ 再デプロイ完了
3. ✅ ローカル環境変数ファイルを更新

## 🔧 手動で設定が必要な項目

### 1. Supabase URL設定（必須）

[Supabase Dashboard](https://supabase.com/dashboard/project/miyqdbmatdwbnrzfnnbo)で以下を設定：

1. 「Authentication」→「URL Configuration」
2. 「Site URL」に追加: `https://ironlog-ai-new.vercel.app`
3. 「Redirect URLs」に追加:
   - `https://ironlog-ai-new.vercel.app/**`
   - `https://ironlog-ai-*.vercel.app/**`

### 2. Google認証の設定（オプション）

Googleログインを使用する場合：

1. Supabase → 「Authentication」→「Providers」→「Google」
2. 「Enable Google provider」を有効化
3. Google Cloud ConsoleでOAuth設定
4. リダイレクトURI: `https://miyqdbmatdwbnrzfnnbo.supabase.co/auth/v1/callback`

## 📝 確認

https://ironlog-ai-new.vercel.app にアクセスして動作確認してください。
