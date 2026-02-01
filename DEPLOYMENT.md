# デプロイ手順

## Firebase設定

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力して作成
4. Google Analyticsの設定（任意）

### 2. Authenticationの有効化

1. Firebase Consoleで「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを開く
4. 「Google」を有効化
   - プロジェクトのサポートメールを設定
   - 保存

### 3. 環境変数の設定

プロジェクトのルートに `.env` ファイルを作成し、以下の環境変数を設定してください：

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Firebase Consoleの「プロジェクトの設定」→「全般」タブから、これらの値を取得できます。

### 4. Gemini APIキーの設定

既存の `.env` ファイルに以下も追加：

```env
GEMINI_API_KEY=your-gemini-api-key
```

## Vercelでのデプロイ

### ⚠️ 重要: 新しいURLでデプロイする方法

同じリポジトリから**新しいプロジェクト**として作成することで、既存のプロジェクトとは**別のURL**でデプロイできます。

**詳細な手順は [NEW_DEPLOYMENT.md](./NEW_DEPLOYMENT.md) を参照してください。**

### 新しいプロジェクトとしてデプロイ（別URL）

#### 方法1: Vercelダッシュボードから作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリをインポート（または手動でアップロード）
4. プロジェクト設定：
   - **Framework Preset**: Vite
   - **Root Directory**: `./`（デフォルト）
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables**セクションで以下を追加：
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   GEMINI_API_KEY=your-gemini-api-key
   ```

6. 「Deploy」をクリック

#### 方法2: Vercel CLIを使用

```bash
# Vercel CLIをインストール（未インストールの場合）
npm i -g vercel

# プロジェクトディレクトリで実行
vercel

# 初回デプロイ時は設定を聞かれます：
# - Set up and deploy? Yes
# - Which scope? あなたのアカウント
# - Link to existing project? No（新しいプロジェクトとして作成）
# - Project name: ironlog-ai-new（任意の名前）
# - Directory: ./
# - Override settings? No

# 環境変数を設定
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

### カスタムドメインの設定（オプション）

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Domains」を選択
3. カスタムドメインを追加

### Firebase認証の承認済みドメイン設定

1. Firebase Consoleで「Authentication」→「Settings」→「承認済みドメイン」を開く
2. 「ドメインを追加」をクリック
3. VercelのデプロイURL（例: `your-project.vercel.app`）を追加
4. カスタムドメインを使用する場合も追加

## ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

`.env` ファイルに環境変数を設定してください。

## トラブルシューティング

### Firebase認証エラー

- Firebase Consoleで「承認済みドメイン」にローカルホスト（`localhost`）とVercelのURLが追加されているか確認
- 環境変数が正しく設定されているか確認

### ビルドエラー

- Node.jsのバージョンが18以上であることを確認
- `npm install`を再実行
- Vercelのビルドログを確認

### 環境変数が読み込まれない

- Vercelの環境変数名が`VITE_`で始まっているか確認
- デプロイ後に環境変数を追加した場合は、再デプロイが必要
