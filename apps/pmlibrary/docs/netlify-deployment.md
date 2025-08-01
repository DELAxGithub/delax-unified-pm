# Netlifyデプロイメント情報

## 本番環境URL
🌐 **https://program-management-pm.netlify.app**

## 管理画面
- Netlify管理画面: https://app.netlify.com/projects/program-management-pm
- ビルドログ: https://app.netlify.com/projects/program-management-pm/deploys/687cf797b45c51052de9ab2a

## 環境変数の設定

Netlifyで動作させるには、以下の環境変数を設定する必要があります：

1. Netlifyの管理画面にアクセス
2. 「Site configuration」→「Environment variables」へ移動
3. 以下の変数を追加：
   - `VITE_SUPABASE_URL`: Supabaseプロジェクトの URL
   - `VITE_SUPABASE_ANON_KEY`: Supabaseの anon key

## デプロイコマンド

### 手動デプロイ
```bash
# ビルド
npm run build

# Netlifyにデプロイ
netlify deploy --prod --dir=dist
```

### 自動デプロイ（GitHub連携）
1. Netlifyの管理画面で「Site configuration」→「Build & deploy」→「Continuous deployment」
2. GitHubリポジトリを接続
3. mainブランチへのプッシュで自動デプロイが実行されます

## 設定ファイル
- `netlify.toml`: ビルド設定とリダイレクト設定を含む

## トラブルシューティング

### 環境変数が反映されない場合
1. Netlifyの管理画面で環境変数を確認
2. デプロイを再実行（「Trigger deploy」→「Clear cache and deploy site」）

### ページのリロードで404エラーが出る場合
- `netlify.toml`の`[[redirects]]`設定が正しく適用されているか確認
- SPAのルーティングに対応したリダイレクト設定が含まれています

## 最終更新日
2025年1月20日