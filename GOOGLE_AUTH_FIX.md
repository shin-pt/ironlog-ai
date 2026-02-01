# Google認証400エラーの修正手順

## エラーの原因

400エラーは、SupabaseのGoogle認証設定が不完全であることを示しています。

## 修正手順

### ステップ1: Supabase URL設定（必須）

[Supabase Dashboard](https://supabase.com/dashboard/project/miyqdbmatdwbnrzfnnbo)で以下を設定：

1. 「Authentication」→「URL Configuration」を開く
2. **「Site URL」**に以下を設定：
   ```
   https://ironlog-ai-new.vercel.app
   ```
3. **「Redirect URLs」**に以下を追加（複数行で追加）：
   ```
   https://ironlog-ai-new.vercel.app
   https://ironlog-ai-new.vercel.app/**
   https://ironlog-ai-*.vercel.app/**
   ```

### ステップ2: Google認証プロバイダーの設定

1. Supabase Dashboard → 「Authentication」→「Providers」→「Google」
2. **「Enable Google provider」**を有効化（トグルをON）
3. Google Cloud Consoleで設定：
   - [Google Cloud Console](https://console.cloud.google.com/)にアクセス
   - プロジェクトを作成または選択
   - 「APIとサービス」→「認証情報」を選択
   - 「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
   - アプリケーションの種類: **「ウェブアプリケーション」**
   - **承認済みのリダイレクト URI**に以下を追加：
     ```
     https://miyqdbmatdwbnrzfnnbo.supabase.co/auth/v1/callback
     ```
   - 「作成」をクリック
   - **クライアントID**と**クライアントシークレット**をコピー
4. Supabaseに戻り、以下を入力：
   - **Client ID (for OAuth)**: Google Cloud Consoleから取得したクライアントID
   - **Client Secret (for OAuth)**: Google Cloud Consoleから取得したクライアントシークレット
5. **「Save」**をクリック

### ステップ3: 確認

設定後、以下にアクセスしてGoogleログインを試してください：
- https://ironlog-ai-new.vercel.app

## よくある問題

### 1. "Redirect URI mismatch"エラー
- Google Cloud Consoleの承認済みリダイレクトURIが正しいか確認
- 正確に `https://miyqdbmatdwbnrzfnnbo.supabase.co/auth/v1/callback` を追加

### 2. "400 Bad Request"エラー
- Supabaseの「Site URL」と「Redirect URLs」が設定されているか確認
- Google認証プロバイダーが有効化されているか確認

### 3. ログイン後すぐにログアウトされる
- Supabaseの「Redirect URLs」に正しいURLが設定されているか確認
- ワイルドカード（`**`）を使用しているか確認

## 設定確認チェックリスト

- [ ] Supabaseの「Site URL」が設定されている
- [ ] Supabaseの「Redirect URLs」が設定されている
- [ ] Google認証プロバイダーが有効化されている
- [ ] Google Cloud ConsoleでOAuthクライアントIDが作成されている
- [ ] Google Cloud ConsoleのリダイレクトURIが正しく設定されている
- [ ] SupabaseにGoogleのクライアントIDとシークレットが入力されている
