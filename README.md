<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1xwSlaLZV6PiPV4TptkBC-uwql6fiVCnX

## セットアップ

**前提条件:** Node.js 18以上

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Firebase設定（必須）
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Gemini API設定（必須）
GEMINI_API_KEY=your-gemini-api-key
```

詳細な設定手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

### 3. Firebase認証の設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. 「Authentication」→「Sign-in method」で「Google」を有効化
3. 承認済みドメインに `localhost` を追加（開発環境用）

### 4. ローカルで実行

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開き、Googleアカウントでログインしてください。

## Vercelへのデプロイ

### 新しいプロジェクトとしてデプロイ（別URL）

既存のプロジェクトとは別の新しいURLでデプロイする場合の手順です。

詳細な手順は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。

#### 方法1: Vercel CLIでデプロイ

```bash
# Vercel CLIをインストール
npm install -g vercel

# ログイン
vercel login

# 新しいプロジェクトとしてデプロイ
vercel

# 環境変数を設定（各環境変数を順番に設定）
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
vercel env add GEMINI_API_KEY

# 本番環境にデプロイ
vercel --prod
```

#### 方法2: Vercelダッシュボードからデプロイ

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリをインポート（または手動でアップロード）
4. プロジェクト設定：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**に以下を追加：
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `GEMINI_API_KEY`
6. 「Deploy」をクリック

### Firebase認証の承認済みドメイン設定

デプロイ後、Firebase Consoleで以下を設定してください：

1. Firebase Console → Authentication → Settings → 承認済みドメイン
2. VercelのデプロイURL（例: `your-project.vercel.app`）を追加
3. カスタムドメインを使用する場合も追加

**注意:** 環境変数はビルド時に使用されるため、デプロイ後に変更した場合は再デプロイが必要です。
