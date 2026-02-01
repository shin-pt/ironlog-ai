# PKCE 401エラーの修正手順

## エラーの原因

`/auth/v1/token?grant_type=pkce` で401エラーが発生する場合、以下のいずれかが原因です：

1. **SupabaseのGoogle認証設定が不完全**
2. **SupabaseのURL設定が正しくない**
3. **Google Cloud Consoleの設定が不完全**

## 修正手順

### ステップ1: Supabase Google認証の確認（最重要）

[Supabase Dashboard](https://supabase.com/dashboard/project/miyqdbmatdwbnrzfnnbo)で確認：

1. **「Authentication」→「Providers」→「Google」**を開く
2. **「Enable Google provider」**が**ON**になっているか確認
3. **「Client ID (for OAuth)」**と**「Client Secret (for OAuth)」**が正しく入力されているか確認
4. **「Save」**をクリック（変更があった場合）

### ステップ2: Supabase URL設定の確認

1. **「Authentication」→「URL Configuration」**を開く
2. **「Site URL」**が以下に設定されているか確認：
   ```
   https://ironlog-ai-new.vercel.app
   ```
3. **「Redirect URLs」**に以下が**すべて**追加されているか確認：
   ```
   https://ironlog-ai-new.vercel.app
   https://ironlog-ai-new.vercel.app/**
   https://ironlog-ai-*.vercel.app/**
   ```

### ステップ3: Google Cloud Consoleの確認

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. **「APIとサービス」→「認証情報」**を選択
3. 作成したOAuth 2.0クライアントIDを確認
4. **「承認済みのリダイレクト URI」**に以下が追加されているか確認：
   ```
   https://miyqdbmatdwbnrzfnnbo.supabase.co/auth/v1/callback
   ```

### ステップ4: テストユーザーの確認

1. **「APIとサービス」→「OAuth同意画面」**を選択
2. **「テストユーザー」**セクションを確認
3. 自分のメールアドレスが追加されているか確認
4. 追加されていない場合は追加

## トラブルシューティング

### エラーが続く場合

1. **ブラウザのキャッシュをクリア**
   - 開発者ツール（F12）→「Application」→「Clear storage」→「Clear site data」

2. **Supabaseの設定を再保存**
   - Supabase DashboardでGoogle認証設定を一度OFFにしてからONに戻す
   - 「Save」をクリック

3. **環境変数の確認**
   - Vercelで`VITE_SUPABASE_URL`と`VITE_SUPABASE_ANON_KEY`が正しく設定されているか確認

4. **ログの確認**
   - ブラウザのコンソールで詳細なエラーメッセージを確認
   - Supabase Dashboardの「Logs」で認証ログを確認

## 設定確認チェックリスト

- [ ] SupabaseのGoogle認証プロバイダーが有効化されている
- [ ] SupabaseにGoogleのクライアントIDとシークレットが入力されている
- [ ] Supabaseの「Site URL」が設定されている
- [ ] Supabaseの「Redirect URLs」が設定されている
- [ ] Google Cloud ConsoleのリダイレクトURIが正しく設定されている
- [ ] テストユーザーとして自分のメールアドレスが追加されている
- [ ] Vercelの環境変数が正しく設定されている
