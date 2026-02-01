# 新しいURLでデプロイする手順

## 重要ポイント

✅ **同じリポジトリから複数のプロジェクトを作成可能**
✅ **それぞれ異なるURLが自動的に割り当てられます**
✅ **既存のプロジェクトには影響しません**

## 方法1: Vercelダッシュボードから（推奨・簡単）

### ステップ1: 新しいプロジェクトを作成

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. **「Add New...」** → **「Project」** をクリック
   - ⚠️ 既存のプロジェクトを選択せず、**新規作成**を選択してください

3. **リポジトリの選択**
   - GitHubリポジトリをインポートする場合：
     - 「Import Git Repository」をクリック
     - 同じリポジトリを選択（既存のプロジェクトとは別のプロジェクトとして作成されます）
   - 手動でアップロードする場合：
     - 「Deploy」タブでZIPファイルをアップロード

### ステップ2: プロジェクト設定

**プロジェクト名を変更**（重要！）
- デフォルト名のままでもOKですが、既存と区別しやすい名前に変更することを推奨
- 例: `ironlog-ai-new`、`ironlog-ai-v2` など

**Framework設定**（自動検出される場合がありますが、確認してください）:
- **Framework Preset**: `Vite`
- **Root Directory**: `./`（デフォルト）
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### ステップ3: 環境変数の設定

**Environment Variables**セクションで以下を追加：

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
GEMINI_API_KEY=your-gemini-api-key
```

### ステップ4: デプロイ

1. **「Deploy」** をクリック
2. デプロイが完了すると、**新しいURL**が表示されます
   - 例: `ironlog-ai-new-abc123.vercel.app`
   - このURLは既存のプロジェクトとは異なります

## 方法2: Vercel CLIを使用

### ステップ1: CLIのセットアップ

```bash
# Vercel CLIをインストール（未インストールの場合）
npm install -g vercel

# ログイン
vercel login
```

### ステップ2: 新しいプロジェクトとしてデプロイ

```bash
# プロジェクトディレクトリで実行
vercel
```

**重要な質問と回答：**

1. **Set up and deploy?** → `Yes`
2. **Which scope?** → あなたのアカウントを選択
3. **Link to existing project?** → **`No`** ⚠️ ここで`No`を選択することで新しいプロジェクトが作成されます
4. **What's your project's name?** → 新しい名前を入力（例: `ironlog-ai-new`）
5. **In which directory is your code located?** → `./`
6. **Want to override the settings?** → `No`

### ステップ3: 環境変数の設定

```bash
# 各環境変数を順番に設定（プロンプトに従って値を入力）
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
vercel env add GEMINI_API_KEY
```

各コマンドで以下を選択：
- **Environment**: `Production`（本番環境）
- **Value**: 実際の値を入力

### ステップ4: 本番環境にデプロイ

```bash
vercel --prod
```

デプロイが完了すると、**新しいURL**が表示されます。

## 確認方法

### 新しいURLの確認

1. Vercelダッシュボードでプロジェクト一覧を確認
2. 作成した新しいプロジェクトをクリック
3. **「Domains」** セクションでURLを確認
   - 例: `ironlog-ai-new-abc123.vercel.app`
   - 既存のプロジェクトとは異なるURLになっています

### 既存プロジェクトとの違い

- ✅ **異なるURL**: それぞれ独自の`.vercel.app`ドメインが割り当てられます
- ✅ **独立した環境変数**: 各プロジェクトで個別に設定できます
- ✅ **独立したデプロイ履歴**: 互いに影響しません
- ✅ **独立した設定**: ビルド設定も個別に変更可能

## Firebase認証の設定

新しいURLでデプロイした後、Firebase Consoleで以下を設定してください：

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択
3. **「Authentication」** → **「Settings」** → **「承認済みドメイン」**
4. **「ドメインを追加」** をクリック
5. 新しいVercelのURL（例: `ironlog-ai-new-abc123.vercel.app`）を追加
6. 既存のURLも残しておく（両方のプロジェクトで使用可能）

## よくある質問

### Q: 既存のプロジェクトに影響しますか？
A: いいえ、完全に独立した新しいプロジェクトとして作成されるため、既存のプロジェクトには一切影響しません。

### Q: 同じリポジトリから複数のプロジェクトを作成できますか？
A: はい、可能です。Vercelでは同じリポジトリから複数のプロジェクトを作成できます。

### Q: 環境変数は共有されますか？
A: いいえ、各プロジェクトで個別に設定する必要があります。

### Q: カスタムドメインを設定できますか？
A: はい、各プロジェクトに個別にカスタムドメインを設定できます。

## トラブルシューティング

### 既存のプロジェクトにリンクされてしまった場合

CLIで`Link to existing project?`に`Yes`と答えてしまった場合：

```bash
# プロジェクトのリンクを解除
vercel unlink

# 再度デプロイ（今度は`No`を選択）
vercel
```

### 環境変数が反映されない

環境変数を追加した後は、**再デプロイ**が必要です：

```bash
vercel --prod
```

または、Vercelダッシュボードから「Redeploy」をクリックしてください。
