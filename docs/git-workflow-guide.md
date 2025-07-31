# 統合PM管理システム Git運用ルール

## 概要
統合ディレクトリ内で複数のプロジェクトを管理しながら、各プロジェクトの正しいリポジトリにコミット・デプロイする運用ルール。

## リポジトリ構成

### 統合管理リポジトリ
- **リポジトリ**: `https://github.com/DELAxGithub/delax-unified-pm.git`
- **用途**: 開発環境の統合管理、文書化、開発ツール統一
- **対象変更**: 
  - プロジェクト共通設定
  - 統合文書
  - 開発スクリプト
  - 全体構成の変更

### 個別プロジェクトリポジトリ

#### PMPlatto (プラッと進捗すごろく)
- **リポジトリ**: `https://github.com/DELAxGithub/PMplatto.git`
- **本番URL**: https://delaxplatto.com
- **ディレクトリ**: `source-repos/PMplatto/`
- **デプロイ**: Git push → Netlify自動デプロイ
- **対象変更**:
  - UIコンポーネント
  - スタイル設定
  - 機能追加・修正

#### PMLibrary (ピーエムライブラリー)
- **リポジトリ**: `https://github.com/DELAxGithub/PMliberary.git`
- **本番URL**: https://pmliberary.com
- **ディレクトリ**: `source-repos/PMliberary/`
- **デプロイ**: Git push → Netlify自動デプロイ
- **対象変更**:
  - エピソード管理機能
  - データベース設計
  - 機能拡張

## Git操作フロー

### 1. 作業前の確認
```bash
# 正しいディレクトリにいるか確認
pwd
git remote -v  # 正しいリポジトリか確認
```

### 2. PMPlatto変更時のフロー
```bash
# PMplattoディレクトリに移動
cd /path/to/delax-unified-pm/source-repos/PMplatto

# リモート確認（必須）
git remote -v
# → origin https://github.com/DELAxGithub/PMplatto.git であることを確認

# 作業・コミット・プッシュ
git add .
git commit -m "変更内容"
git push origin master  # ⚠️ PMplattoはmasterブランチ
```

### 3. PMLibrary変更時のフロー
```bash
# PMLibraryディレクトリに移動
cd /path/to/delax-unified-pm/source-repos/PMliberary

# リモート確認（必須）
git remote -v
# → origin https://github.com/DELAxGithub/PMliberary.git であることを確認

# 作業・コミット・プッシュ
git add .
git commit -m "変更内容"
git push origin main  # ⚠️ PMLibraryはmainブランチ
```

### 4. 統合環境変更時のフロー
```bash
# 統合ディレクトリのルートに移動
cd /path/to/delax-unified-pm

# リモート確認（必須）
git remote -v
# → origin https://github.com/DELAxGithub/delax-unified-pm.git であることを確認

# 作業・コミット・プッシュ
git add .
git commit -m "変更内容"  
git push origin main  # ⚠️ 統合環境はmainブランチ
```

## 注意事項

### ⚠️ 重要な確認事項
1. **必ずリモート確認**: `git remote -v` で正しいリポジトリか確認
2. **ブランチ名注意**: PMplatto=master, その他=main
3. **作業ディレクトリ**: 正しいプロジェクトディレクトリで作業

### 🚨 よくある間違い
- ❌ 統合環境で個別プロジェクトの変更をコミット
- ❌ 間違ったリポジトリにプッシュ
- ❌ ブランチ名の間違い（master/main）

### ✅ 確認方法
- デプロイ後は必ず本番URLで動作確認
- PMPlatto: https://delaxplatto.com
- PMLibrary: https://pmliberary.com

## 自動デプロイ確認

### Netlify連携状況
- **PMPlatto**: master branch → https://delaxplatto.com (自動デプロイ有効)
- **PMLibrary**: main branch → https://pmliberary.com (自動デプロイ有効)

### デプロイ時間
- 通常1-3分でデプロイ完了
- 変更反映まで最大5分程度

## トラブルシューティング

### デプロイが反映されない場合
1. 正しいリポジトリにプッシュしたか確認
2. Netlifyのビルドログ確認
3. ブラウザキャッシュクリア

### 間違ったリポジトリにプッシュした場合
1. 正しいリポジトリに同じ変更を適用
2. 間違ったリポジトリの変更は必要に応じてリバート

## 開発効率向上のために

### 推奨作業フロー
1. 統合ディレクトリで全体把握
2. 個別プロジェクトディレクトリで実装
3. 正しいリポジトリにコミット・プッシュ
4. 自動デプロイ確認

### VS Code設定
- マルチルートワークスペースの活用
- Git統合機能でリポジトリ確認
- ターミナルでのディレクトリ移動

---

## 更新履歴
- 2025-01-31: 初版作成（緑基調テーマ導入時）