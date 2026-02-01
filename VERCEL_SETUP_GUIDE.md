# Vercelでの新しいプロジェクト作成ガイド（ステップ3の解決方法）

## 現在の状況

Vercelの「新しいプロジェクトを作成」ページで、ステップ3（リポジトリの選択）でつまずいています。

## 解決方法

### パターン1: リポジトリがGitHubにまだプッシュされていない場合

このプロジェクトをGitHubにプッシュする必要があります。

#### 手順：

1. **GitHubでリポジトリを作成**
   - [GitHub](https://github.com/new)にアクセス
   - リポジトリ名を入力（例: `ironlog-ai`）
   - 「Create repository」をクリック

2. **ローカルでGitを初期化してプッシュ**
   ```bash
   # プロジェクトディレクトリに移動
   cd "/Users/shinyamacbook/Desktop/ironlog-aiのコピー"
   
   # Gitを初期化（まだの場合）
   git init
   
   # ファイルを追加
   git add .
   
   # コミット
   git commit -m "Initial commit"
   
   # GitHubリポジトリを追加（YOUR_USERNAMEとYOUR_REPO_NAMEを置き換え）
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   
   # プッシュ
   git branch -M main
   git push -u origin main
   ```

3. **Vercelに戻る**
   - Vercelのページをリフレッシュ（F5キー）
   - または「検索...」でリポジトリ名を検索
   - リポジトリが表示されたら「インポート」をクリック

### パターン2: リポジトリが既にGitHubにあるが表示されない場合

1. **Vercelページをリフレッシュ**
   - F5キーを押すか、ページを再読み込み

2. **検索バーで検索**
   - 左側の「検索...」フィールドに `ironlog` と入力
   - リポジトリが表示されるか確認

3. **GitHub接続を確認**
   - Vercelダッシュボードの「Settings」→「Git」でGitHub接続を確認
   - 必要に応じて再接続

### パターン3: 手動でアップロードする方法（GitHub不要）

GitHubにプッシュせずに、直接Vercelにデプロイする方法：

1. **プロジェクトをZIPファイルに圧縮**
   ```bash
   # プロジェクトディレクトリに移動
   cd "/Users/shinyamacbook/Desktop/ironlog-aiのコピー"
   
   # 親ディレクトリに移動してZIPを作成
   cd ..
   zip -r ironlog-ai.zip "ironlog-aiのコピー" -x "*.git*" -x "node_modules/*" -x "dist/*"
   ```

2. **Vercelで手動アップロード**
   - Vercelの「新しいプロジェクトを作成」ページで
   - 上部の「デプロイするGitリポジトリのURLを入力してください...」の下にある
   - 「または、ZIPファイルをアップロード」をクリック
   - 作成したZIPファイルを選択

### パターン4: 既存のリポジトリから新しいプロジェクトを作成する場合

画像に表示されているリポジトリのいずれかを使用する場合：

1. **リポジトリを選択**
   - 左側のリストから適切なリポジトリを選択
   - 「インポート」ボタンをクリック

2. **プロジェクト名を変更**（重要！）
   - 既存のプロジェクトと区別するため、新しい名前を設定
   - 例: `ironlog-ai-new`、`ironlog-ai-v2` など

## 次のステップ（リポジトリ選択後）

リポジトリを選択したら：

### ステップ4: プロジェクト設定

1. **プロジェクト名を変更**
   - デフォルト名を変更して、既存のプロジェクトと区別
   - 例: `ironlog-ai-new`

2. **Framework設定を確認**
   - **Framework Preset**: `Vite` を選択
   - **Root Directory**: `./`（デフォルト）
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### ステップ5: 環境変数の設定

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

### ステップ6: デプロイ

1. **「Deploy」** をクリック
2. デプロイが完了すると、**新しいURL**が表示されます

## トラブルシューティング

### リポジトリが見つからない

- GitHubにプッシュされているか確認
- VercelのGitHub接続を確認
- ページをリフレッシュ

### エラーが発生する

- 環境変数が正しく設定されているか確認
- Firebase設定が完了しているか確認
- ビルドログを確認

## 推奨手順

1. **まずGitHubにプッシュ**（パターン1）
2. **Vercelでリポジトリをインポート**
3. **新しいプロジェクト名を設定**
4. **環境変数を設定**
5. **デプロイ**
