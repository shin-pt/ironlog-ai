# Vercel環境変数の設定手順

## 現在のエラー

Firebase環境変数が設定されていないため、アプリが動作していません。

## 解決方法

### ステップ1: Firebaseプロジェクトの作成（まだの場合）

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `ironlog-ai`）
4. Google Analyticsの設定（任意）
5. 「プロジェクトを作成」をクリック

### ステップ2: Firebase設定値の取得

1. Firebase Consoleでプロジェクトを選択
2. 左上の⚙️アイコン → 「プロジェクトの設定」をクリック
3. 「全般」タブで「マイアプリ」セクションを確認
4. 以下の値をコピー：
   - **API Key** → `VITE_FIREBASE_API_KEY`
   - **Auth Domain** → `VITE_FIREBASE_AUTH_DOMAIN`（通常は `プロジェクトID.firebaseapp.com`）
   - **Project ID** → `VITE_FIREBASE_PROJECT_ID`
   - **Storage Bucket** → `VITE_FIREBASE_STORAGE_BUCKET`（通常は `プロジェクトID.appspot.com`）
   - **Messaging Sender ID** → `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - **App ID** → `VITE_FIREBASE_APP_ID`

### ステップ3: Authenticationの有効化

1. Firebase Consoleで「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを開く
4. 「Google」を有効化
   - プロジェクトのサポートメールを設定
   - 「保存」をクリック

### ステップ4: Vercelに環境変数を設定

#### 方法A: Vercelダッシュボードから（推奨）

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. `ironlog-ai-new` プロジェクトを開く
3. 「Settings」→「Environment Variables」を選択
4. 以下の環境変数を1つずつ追加：

| キー | 値の例 | 説明 |
|------|--------|------|
| `VITE_FIREBASE_API_KEY` | `AIza...` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` | Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | `1:123456789:web:abc123` | App ID |
| `GEMINI_API_KEY` | `your-gemini-key` | Gemini API Key |

5. 各環境変数で「Environment」を選択：
   - **Production** にチェック
   - **Preview** にチェック（オプション）
   - **Development** にチェック（オプション）

6. すべて追加したら、**「Redeploy」**をクリック

#### 方法B: CLIで設定

```bash
cd "/Users/shinyamacbook/Desktop/ironlog-aiのコピー"

# 各環境変数を設定（プロンプトに従って値を入力）
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_PROJECT_ID production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
vercel env add VITE_FIREBASE_APP_ID production
vercel env add GEMINI_API_KEY production

# 再デプロイ
vercel --prod
```

### ステップ5: Firebase承認済みドメインの設定

1. Firebase Console → 「Authentication」→ 「Settings」→ 「承認済みドメイン」
2. 「ドメインを追加」をクリック
3. 以下を追加：
   - `ironlog-ai-new.vercel.app`
   - `ironlog-ai-*.vercel.app`（プレビュー用）

### ステップ6: 再デプロイ

環境変数を設定した後、必ず再デプロイしてください：

- Vercelダッシュボードから「Redeploy」をクリック
- または `vercel --prod` を実行

## 確認

再デプロイ後、以下にアクセスして動作を確認：
- https://ironlog-ai-new.vercel.app

Googleログインが正常に動作するはずです。
