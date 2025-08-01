# セットアップガイド - リベラリー進捗すごろく

このガイドでは、別のMacで開発環境をセットアップする手順を説明します。

## 前提条件

- Node.js 18以上がインストールされていること
- Gitがインストールされていること
- GitHubへのアクセス権限があること

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/DELAxGithub/PMliberary.git
cd PMliberary
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

#### `.env`ファイルの作成

プロジェクトルートに`.env`ファイルを作成し、以下の内容を設定：

```env
VITE_SUPABASE_URL=https://pfrzcteapmwufnovmmfc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMDAwNTAsImV4cCI6MjA2ODU3NjA1MH0.We0I0UDqKfS9jPSzDvWtQmB7na8YvCld6_Kko4uBCdU
```

#### `.env.local`ファイルの作成（Supabase CLI用）

```env
# Local environment variables (DO NOT COMMIT)
SUPABASE_DB_PASSWORD=Kode19780627!
SUPABASE_ACCESS_TOKEN=sbp_e5e4cde5382d2dc390a84b2fcb14aa9363ff04d7
```

**注意**: `.env.local`の値は管理者から取得してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 にアクセスして動作確認。

## オプション設定

### Supabase CLIのセットアップ（データベース管理用）

プロジェクトには`supabase-cli`バイナリが含まれています：

```bash
# 実行権限の付与
chmod +x ./supabase-cli

# Supabaseプロジェクトとのリンク
./supabase-cli link --project-ref pfrzcteapmwufnovmmfc

# データベースのマイグレーション実行
./supabase-cli db push
```

### Netlify CLIのセットアップ（デプロイ用）

```bash
# Netlify CLIのインストール
npm install -g netlify-cli

# Netlifyにログイン
netlify login

# プロジェクトとのリンク
netlify link

# デプロイ
netlify deploy --prod --dir=dist
```

## 利用可能なスクリプト

```bash
# 開発サーバー
npm run dev

# ビルド
npm run build

# Lint
npm run lint

# プレビュー
npm run preview

# Supabase関連
npm run supabase:start    # ローカルSupabase起動
npm run supabase:stop     # ローカルSupabase停止
npm run supabase:status   # ステータス確認
npm run supabase:db:push  # DBマイグレーション
```

## トラブルシューティング

### 認証エラーが発生する場合
- `.env`ファイルの環境変数が正しく設定されているか確認
- ブラウザのキャッシュをクリア

### Supabase CLIが動作しない場合
- 実行権限があるか確認: `ls -la supabase-cli`
- `.env.local`の認証情報が正しいか確認

### ビルドエラーが発生する場合
- Node.jsのバージョンを確認: `node -v` (18以上必要)
- `node_modules`を削除して再インストール:
  ```bash
  rm -rf node_modules
  npm install
  ```

## 本番環境

- URL: https://program-management-pm.netlify.app
- 管理画面: https://app.netlify.com/projects/program-management-pm

## 関連ドキュメント

- [Netlifyデプロイメント情報](./netlify-deployment.md)
- [データベース設計](./database-design.md)
- [データベース移行ガイド](./database-migration-guide.md)