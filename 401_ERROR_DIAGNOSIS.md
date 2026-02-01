# 401エラーの診断と解決方法

## 現在のエラー

```
miyqdbmatdwbnrzfnnbo.supabase.co/auth/v1/token?grant_type=pkce:1
Failed to load resource: the server responded with a status of 401 ()
```

このエラーは、PKCEフローでトークンを交換する際に発生しています。

## 考えられる原因

### 1. SupabaseのGoogle認証設定が不完全（最も可能性が高い）

**確認事項：**

1. [Supabase Dashboard](https://supabase.com/dashboard/project/miyqdbmatdwbnrzfnnbo)にアクセス
2. 「Authentication」→「Providers」→「Google」を開く
3. 以下を確認：
   - ✅ 「Enable Sign in with Google」が**ON**になっている
   - ✅ 「Client ID (for OAuth)」が正しく入力されている
   - ✅ 「Client Secret (for OAuth)」が正しく入力されている
   - ✅ 「Callback URL」が `https://miyqdbmatdwbnrzfnnbo.supabase.co/auth/v1/callback` になっている
   - ✅ 「Save」をクリックして保存されている

### 2. Google Cloud Consoleの設定

**確認事項：**

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 「APIとサービス」→「認証情報」を選択
3. OAuth 2.0クライアントIDを確認：
   - ✅ 「承認済みのリダイレクト URI」に以下が追加されている：
     ```
     https://miyqdbmatdwbnrzfnnbo.supabase.co/auth/v1/callback
     ```

### 3. テストユーザーの設定

**確認事項：**

1. 「APIとサービス」→「OAuth同意画面」を選択
2. 「テストユーザー」セクションを確認：
   - ✅ 自分のメールアドレスが追加されている
   - ✅ 追加したメールアドレスでログインしている

### 4. Supabase URL設定

**確認事項：**

1. Supabase Dashboard → 「Authentication」→「URL Configuration」
2. 以下を確認：
   - ✅ 「Site URL」: `https://ironlog-ai-new.vercel.app`
   - ✅ 「Redirect URLs」に以下が追加されている：
     - `https://ironlog-ai-new.vercel.app`
     - `https://ironlog-ai-new.vercel.app/**`
     - `https://ironlog-ai-*.vercel.app/**`

## デバッグ手順

### ステップ1: ブラウザのコンソールで確認

1. F12キーで開発者ツールを開く
2. 「Console」タブを選択
3. ログインを試す
4. エラーメッセージを確認：
   - 「Supabase設定:」のログを確認
   - 「Google認証を開始:」のログを確認
   - 「Supabase認証エラー:」のログを確認

### ステップ2: Networkタブで確認

1. 開発者ツールの「Network」タブを開く
2. ログインを試す
3. `/auth/v1/token` のリクエストを確認：
   - リクエストヘッダーを確認
   - レスポンスの詳細を確認
   - エラーメッセージを確認

### ステップ3: Supabaseのログを確認

1. Supabase Dashboard → 「Logs」→「Auth Logs」
2. 認証試行のログを確認
3. エラーの詳細を確認

## 解決方法

### 方法1: Supabase設定を再保存

1. Supabase Dashboard → 「Authentication」→「Providers」→「Google」
2. 「Enable Sign in with Google」を一度OFFにする
3. 「Save」をクリック
4. 再度ONにする
5. 「Save」をクリック

### 方法2: Google認証情報を再入力

1. Google Cloud ConsoleでクライアントIDとシークレットを再確認
2. Supabaseに再度入力
3. 「Save」をクリック

### 方法3: ブラウザのキャッシュをクリア

1. F12 → 「Application」タブ
2. 「Clear storage」を選択
3. 「Clear site data」をクリック
4. ページをリロード

## 確認チェックリスト

- [ ] SupabaseのGoogle認証プロバイダーが有効化されている
- [ ] SupabaseにGoogleのクライアントIDが正しく入力されている
- [ ] SupabaseにGoogleのクライアントシークレットが正しく入力されている
- [ ] SupabaseのCallback URLが正しく設定されている
- [ ] Google Cloud ConsoleのリダイレクトURIが正しく設定されている
- [ ] テストユーザーとして自分のメールアドレスが追加されている
- [ ] SupabaseのSite URLが設定されている
- [ ] SupabaseのRedirect URLsが設定されている
- [ ] ブラウザのキャッシュをクリアした

## 次のステップ

上記の確認が完了したら、再度ログインを試してください。まだエラーが発生する場合は、ブラウザのコンソールとNetworkタブの詳細なエラーメッセージを共有してください。
