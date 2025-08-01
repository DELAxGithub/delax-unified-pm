# クイックデプロイガイド

## 現在の状況
- ビルド済みファイルは `/dist` フォルダに準備完了
- gitコマンドがDropbox同期でタイムアウトする問題

## 即座にデプロイする方法

### 方法1: Netlifyに直接デプロイ（推奨）
1. Netlifyダッシュボード (https://app.netlify.com) を開く
2. 「Sites」タブで新しいサイトエリアを探す
3. **distフォルダ**をドラッグ＆ドロップ
4. 数秒でデプロイ完了

### 方法2: zip化してアップロード
```bash
# distフォルダをzip化
cd /Users/delax/Library/CloudStorage/Dropbox/アプリ/PM
zip -r dist.zip dist/
```
そしてNetlifyにアップロード

## 環境変数の設定
デプロイ後、Netlifyダッシュボードで：
1. Site Settings → Environment Variables
2. 以下を追加：
```
VITE_SUPABASE_URL=https://pfrzcteapmwufnovmmfc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcnpjdGVhcG13dWZub3ZtbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxMzI2NzMsImV4cCI6MjA1MDcwODY3M30.DVa1l2mqY5V2lxgjr1O5LQFnGMdE-r-FCVHJO3kJx8U
```

## GitHubへのプッシュ（後で）
Dropbox同期が落ち着いたら、以下の方法で：
1. GitHub Desktop を使用
2. または別の場所にクローンしてプッシュ
3. VSCodeのGit機能を使用

## 注意事項
- UIは表示されますが、Supabaseデータベースの接続設定が必要です
- 環境変数を設定するまで、認証機能は動作しません