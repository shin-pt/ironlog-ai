# Supabase設定値の取得方法

## プロジェクト情報

プロジェクトID: `miyqdbmatdwbnrzfnnbo`
プロジェクトURL: https://supabase.com/dashboard/project/miyqdbmatdwbnrzfnnbo

## 設定値の取得手順

### ステップ1: API設定値を取得

1. [Supabase Dashboard](https://supabase.com/dashboard/project/miyqdbmatdwbnrzfnnbo)にアクセス
2. 左サイドバーの「Settings」（⚙️アイコン）をクリック
3. 「API」を選択
4. 以下の値をコピー：

**Project URL:**
```
https://miyqdbmatdwbnrzfnnbo.supabase.co
```

**anon public key:**
- 「Project API keys」セクションの「anon」タブを確認
- 「public」キーをコピー（`eyJhbGc...`で始まる長い文字列）

### ステップ2: Google認証の設定

1. 左サイドバーの「Authentication」→「Providers」を選択
2. 「Google」を探してクリック
3. 「Enable Google provider」を有効化
4. Google Cloud Consoleで設定：
   - [Google Cloud Console](https://console.cloud.google.com/)にアクセス
   - プロジェクトを作成または選択
   - 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuth 2.0 クライアント ID」
   - 承認済みのリダイレクト URIに以下を追加：
     ```
     https://miyqdbmatdwbnrzfnnbo.supabase.co/auth/v1/callback
     ```
   - クライアントIDとシークレットをコピー
5. Supabaseに戻り、Google認証情報を入力して保存

### ステップ3: URL設定

1. Supabase Dashboard → 「Authentication」→ 「URL Configuration」
2. 「Site URL」に以下を追加：
   ```
   https://ironlog-ai-new.vercel.app
   ```
3. 「Redirect URLs」に以下を追加：
   ```
   https://ironlog-ai-new.vercel.app/**
   https://ironlog-ai-*.vercel.app/**
   ```

## 次のステップ

設定値を取得したら、Vercelに環境変数を設定してください。
