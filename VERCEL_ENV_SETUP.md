# Vercel環境変数の設定手順

## Supabase設定値

画像から確認した設定値：

- **Project URL**: `https://miyqdbmatdwbnrzfnnbo.supabase.co`
- **Public API Key**: `sb_publishable_f9nuPoD4ddAjPMoszlqLUw_m48kcaSg`

## Vercelに環境変数を設定

### 方法1: Vercelダッシュボードから（推奨・簡単）

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. `ironlog-ai-new` プロジェクトを開く
3. 「Settings」→「Environment Variables」を選択
4. 以下の3つの環境変数を追加：

#### 環境変数1: VITE_SUPABASE_URL
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://miyqdbmatdwbnrzfnnbo.supabase.co`
- **Environment**: Production にチェック

#### 環境変数2: VITE_SUPABASE_ANON_KEY
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `sb_publishable_f9nuPoD4ddAjPMoszlqLUw_m48kcaSg`
- **Environment**: Production にチェック

#### 環境変数3: GEMINI_API_KEY
- **Key**: `GEMINI_API_KEY`
- **Value**: （あなたのGemini API Key）
- **Environment**: Production にチェック

5. すべて追加したら、ページ上部の「Redeploy」をクリック

### 方法2: CLIで設定

ターミナルで以下のコマンドを実行してください：

```bash
cd "/Users/shinyamacbook/Desktop/ironlog-aiのコピー"

# Supabase URLを設定
vercel env add VITE_SUPABASE_URL production
# プロンプトが表示されたら: https://miyqdbmatdwbnrzfnnbo.supabase.co

# Supabase Anon Keyを設定
vercel env add VITE_SUPABASE_ANON_KEY production
# プロンプトが表示されたら: sb_publishable_f9nuPoD4ddAjPMoszlqLUw_m48kcaSg

# Gemini API Keyを設定（既にある場合はスキップ）
vercel env add GEMINI_API_KEY production
# プロンプトが表示されたら: （あなたのGemini API Key）

# 再デプロイ
vercel --prod
```

## 確認

環境変数を設定して再デプロイ後、以下にアクセス：
- https://ironlog-ai-new.vercel.app

エラーが解消され、ログイン画面が表示されるはずです。

## 次のステップ: Google認証の設定

Googleログインを使用する場合：

1. [Supabase Dashboard](https://supabase.com/dashboard/project/miyqdbmatdwbnrzfnnbo) → 「Authentication」→「Providers」→「Google」
2. 「Enable Google provider」を有効化
3. Google Cloud ConsoleでOAuth設定
4. 承認済みリダイレクトURI: `https://miyqdbmatdwbnrzfnnbo.supabase.co/auth/v1/callback`
