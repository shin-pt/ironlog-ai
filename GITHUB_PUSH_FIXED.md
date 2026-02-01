# GitHubにプッシュする手順（修正版）

## 現在の状況

Gitリポジトリは初期化済みで、コミットも完了しています。
次はGitHubにリポジトリを作成してからプッシュします。

## ステップ1: GitHubでリポジトリを作成

1. **[GitHub](https://github.com/new)にアクセス**してログイン
2. **リポジトリ名を入力**: `ironlog-ai`（または任意の名前）
3. **「Public」または「Private」を選択**
4. **⚠️ 重要**: 「Initialize this repository with」のチェックは**すべて外す**
   - README、.gitignore、ライセンスは追加しない（既にローカルにあるため）
5. **「Create repository」をクリック**

## ステップ2: 正しいURLでプッシュ

GitHubでリポジトリを作成したら、以下のコマンドを実行してください：

```bash
# プロジェクトディレクトリに移動（既にいる場合は不要）
cd "/Users/shinyamacbook/Desktop/ironlog-aiのコピー"

# リモートを追加（YOUR_USERNAMEを実際のGitHubユーザー名に置き換え）
# 例: shin-pt の場合 → git remote add origin https://github.com/shin-pt/ironlog-ai.git
git remote add origin https://github.com/YOUR_USERNAME/ironlog-ai.git

# プッシュ
git push -u origin main
```

### GitHubユーザー名の確認方法

1. GitHubにログイン
2. 右上のプロフィール画像をクリック
3. ユーザー名を確認（例: `shin-pt`）

## ステップ3: Vercelでインポート

1. **Vercelのページをリフレッシュ**（F5キー）
2. 左側の「検索...」に `ironlog` と入力
3. リポジトリが表示されたら「**インポート**」をクリック
4. **プロジェクト名を変更**（例: `ironlog-ai-new`）
5. **環境変数を設定**
6. **「Deploy」をクリック**

## トラブルシューティング

### エラー: "Repository not found"

- GitHubでリポジトリが作成されているか確認
- URLのユーザー名が正しいか確認
- リポジトリ名が正しいか確認

### エラー: "Permission denied"

- GitHubの認証情報を確認
- 必要に応じて `git credential-manager` を使用

### リモートが既に設定されている場合

```bash
# 既存のリモートを削除
git remote remove origin

# 新しいリモートを追加
git remote add origin https://github.com/YOUR_USERNAME/ironlog-ai.git
```
