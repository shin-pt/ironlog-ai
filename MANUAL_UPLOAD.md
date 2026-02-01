# Vercelに手動でアップロードする方法（GitHub不要）

## 現在の状況

ステップ3（リポジトリの選択）でつまずいている場合、GitHubにプッシュせずに直接アップロードできます。

## 手順

### ステップ1: ZIPファイルを準備

デスクトップに `ironlog-ai.zip` が作成されています。

**注意**: このZIPファイルには `node_modules` が含まれている可能性があります。Vercelは自動的に `npm install` を実行するので、問題ありませんが、ファイルサイズが大きい場合は以下の手順で再作成してください：

```bash
# プロジェクトディレクトリに移動
cd "/Users/shinyamacbook/Desktop/ironlog-aiのコピー"

# node_modulesを除外してZIPを作成
zip -r ../ironlog-ai-clean.zip . -x "node_modules/*" -x "dist/*" -x ".git/*" -x "*.DS_Store"
```

### ステップ2: Vercelでアップロード

1. **Vercelの「新しいプロジェクトを作成」ページで**
   - 現在開いているページの上部を見てください
   - 「デプロイするGitリポジトリのURLを入力してください...」という入力欄があります

2. **手動アップロードオプションを探す**
   - 入力欄の下または右側に「または、ZIPファイルをアップロード」または「Upload」というボタンがあるはずです
   - 見つからない場合は、ページを少し下にスクロールしてください

3. **ZIPファイルを選択**
   - 「Upload」または「アップロード」ボタンをクリック
   - デスクトップの `ironlog-ai.zip` を選択

### ステップ3: プロジェクト設定

1. **プロジェクト名を入力**
   - 例: `ironlog-ai-new`

2. **Framework設定を確認**
   - **Framework Preset**: `Vite` を選択
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### ステップ4: 環境変数の設定

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

### ステップ5: デプロイ

1. **「Deploy」** をクリック
2. デプロイが完了すると、**新しいURL**が表示されます

## もし手動アップロードオプションが見つからない場合

Vercelのインターフェースが変更されている可能性があります。その場合は：

1. **GitHubにプッシュする方法**（`GITHUB_PUSH.md`を参照）
2. **Vercel CLIを使用する方法**（`NEW_DEPLOYMENT.md`を参照）

を試してください。
