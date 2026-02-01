# GitHubにプッシュする手順

## ステップ1: GitHubでリポジトリを作成

1. [GitHub](https://github.com/new)にアクセスしてログイン
2. リポジトリ名を入力（例: `ironlog-ai`）
3. 「Public」または「Private」を選択
4. 「Create repository」をクリック

## ステップ2: ローカルでGitを初期化してプッシュ

以下のコマンドをターミナルで実行してください：

```bash
# プロジェクトディレクトリに移動
cd "/Users/shinyamacbook/Desktop/ironlog-aiのコピー"

# Gitを初期化
git init

# ファイルを追加
git add .

# コミット
git commit -m "Initial commit: Add Google login and Vercel deployment"

# GitHubリポジトリを追加（YOUR_USERNAMEをあなたのGitHubユーザー名に置き換え）
git remote add origin https://github.com/YOUR_USERNAME/ironlog-ai.git

# メインブランチに設定してプッシュ
git branch -M main
git push -u origin main
```

**注意**: `YOUR_USERNAME` をあなたのGitHubユーザー名に置き換えてください。

## ステップ3: Vercelに戻る

1. Vercelのページをリフレッシュ（F5キー）
2. 左側の「検索...」に `ironlog` と入力
3. リポジトリが表示されたら「インポート」をクリック
4. プロジェクト名を変更（例: `ironlog-ai-new`）
5. 環境変数を設定
6. 「Deploy」をクリック
