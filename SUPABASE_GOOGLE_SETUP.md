# SupabaseにGoogle認証を設定

## 取得した認証情報

⚠️ **重要**: 認証情報は安全に保管してください。このファイルには含めません。
- Google Cloud Consoleで取得した**クライアントID**と**クライアントシークレット**を準備してください

## Supabaseでの設定手順

### ステップ1: Supabase Dashboardにアクセス

1. [Supabase Dashboard](https://supabase.com/dashboard/project/miyqdbmatdwbnrzfnnbo)にアクセス
2. 左サイドバーの「Authentication」→「Providers」を選択

### ステップ2: Google認証を有効化

1. 「Google」プロバイダーを探してクリック
2. **「Enable Google provider」**のトグルをONにする
3. 以下の認証情報を入力：

   **Client ID (for OAuth):**
   ```
   （Google Cloud Consoleで取得したクライアントIDを入力）
   ```

   **Client Secret (for OAuth):**
   ```
   （Google Cloud Consoleで取得したクライアントシークレットを入力）
   ```

4. **「Save」**をクリック

### ステップ3: URL設定の確認

1. 「Authentication」→「URL Configuration」を開く
2. **「Site URL」**が以下に設定されているか確認：
   ```
   https://ironlog-ai-new.vercel.app
   ```
3. **「Redirect URLs」**に以下が追加されているか確認：
   ```
   https://ironlog-ai-new.vercel.app
   https://ironlog-ai-new.vercel.app/**
   https://ironlog-ai-*.vercel.app/**
   ```

### ステップ4: テストユーザーの追加（重要）

現在、OAuthアクセスはテストユーザーに制限されています。自分のメールアドレスを追加する必要があります：

1. [Google Cloud Console](https://console.cloud.google.com/)に戻る
2. 「APIとサービス」→「OAuth同意画面」を選択
3. 「テストユーザー」セクションを開く
4. 「+ ユーザーを追加」をクリック
5. 自分のGoogleアカウントのメールアドレスを入力
6. 「追加」をクリック

## 確認

設定が完了したら：

1. https://ironlog-ai-new.vercel.app にアクセス
2. 「Googleでログイン」をクリック
3. Googleアカウントでログイン

正常に動作するはずです！

## トラブルシューティング

### エラー: "Access blocked: This app's request is invalid"
- テストユーザーとして自分のメールアドレスが追加されているか確認
- OAuth同意画面でテストユーザーが設定されているか確認

### エラー: "400 Bad Request"
- Supabaseの「Site URL」と「Redirect URLs」が正しく設定されているか確認
- Google Cloud Consoleの承認済みリダイレクトURIが正しいか確認

### 本番環境で使用する場合

テストユーザー制限を解除するには：
1. Google Cloud Console → 「OAuth同意画面」
2. 「公開」をクリック
3. 警告を確認して「公開」を確定
