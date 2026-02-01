# Supabase設定手順

## ステップ1: Supabaseプロジェクトの作成

1. [Supabase Dashboard](https://app.supabase.com/)にアクセス
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - **Name**: `ironlog-ai`（任意の名前）
   - **Database Password**: 強力なパスワードを設定（忘れないように保存）
   - **Region**: 最寄りのリージョンを選択（例: Northeast Asia (Tokyo)）
   - **Pricing Plan**: Free プランで開始可能
4. 「Create new project」をクリック
5. プロジェクトの作成が完了するまで数分待機（通常2-3分）

## ステップ2: Supabase設定値の取得

1. Supabase Dashboardでプロジェクトを選択
2. 左サイドバーの「Settings」→「API」をクリック
3. 以下の値をコピー：
   - **Project URL** → `VITE_SUPABASE_URL`
     - 例: `https://abcdefghijklmnop.supabase.co`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
     - 「anon」タブの「public」キーをコピー

## ステップ3: Authenticationの設定（Google認証）

1. Supabase Dashboardで「Authentication」→「Providers」を選択
2. 「Google」を探してクリック
3. 「Enable Google provider」を有効化
4. Google Cloud Consoleで設定：
   - [Google Cloud Console](https://console.cloud.google.com/)にアクセス
   - 新しいプロジェクトを作成（または既存のプロジェクトを選択）
   - 「APIとサービス」→「認証情報」を選択
   - 「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
   - アプリケーションの種類: 「ウェブアプリケーション」
   - 承認済みのリダイレクト URI: 
     ```
     https://abcdefghijklmnop.supabase.co/auth/v1/callback
     ```
     （`abcdefghijklmnop`をあなたのSupabaseプロジェクトIDに置き換え）
   - 「作成」をクリック
   - **クライアントID**と**クライアントシークレット**をコピー
5. Supabaseに戻り、Google認証情報を入力：
   - **Client ID (for OAuth)**: Google Cloud Consoleから取得したクライアントID
   - **Client Secret (for OAuth)**: Google Cloud Consoleから取得したクライアントシークレット
6. 「Save」をクリック

## ステップ4: ローカル環境変数の設定

プロジェクトのルートに `.env.local` ファイルを作成：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

## ステップ5: Vercel環境変数の設定

### 方法A: Vercelダッシュボードから（推奨）

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. `ironlog-ai-new` プロジェクトを開く
3. 「Settings」→「Environment Variables」を選択
4. 以下の環境変数を追加：

| キー | 値の例 | 説明 |
|------|--------|------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Anon Key |
| `GEMINI_API_KEY` | `your-key` | Gemini API Key |

5. 各環境変数で「Production」にチェック
6. 「Redeploy」をクリック

### 方法B: CLIで設定

```bash
cd "/Users/shinyamacbook/Desktop/ironlog-aiのコピー"

vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add GEMINI_API_KEY production

vercel --prod
```

## ステップ6: 承認済みURLの設定

1. Supabase Dashboard → 「Authentication」→ 「URL Configuration」
2. 「Site URL」に以下を追加：
   - `https://ironlog-ai-new.vercel.app`
3. 「Redirect URLs」に以下を追加：
   - `https://ironlog-ai-new.vercel.app/**`
   - `https://ironlog-ai-*.vercel.app/**`（プレビュー用）

## 確認

再デプロイ後、以下にアクセスして動作を確認：
- https://ironlog-ai-new.vercel.app

Googleログインが正常に動作するはずです。

## トラブルシューティング

### エラー: "Invalid API key"
- SupabaseのURLとAnon Keyが正しく設定されているか確認
- Vercelで環境変数を設定した後、必ず再デプロイ

### エラー: "Redirect URI mismatch"
- Google Cloud Consoleの承認済みリダイレクトURIが正しいか確認
- SupabaseのコールバックURL: `https://your-project.supabase.co/auth/v1/callback`

### ログイン後すぐにログアウトされる
- Supabaseの「Site URL」と「Redirect URLs」が正しく設定されているか確認
