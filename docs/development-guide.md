# DELAx Unified PM 開発ガイド

## 概要

PMLibraryとPMPlattoを統合する統一番組制作管理プラットフォームの開発ガイドです。

## 開発環境セットアップ

### 必要な環境
- Node.js 18.0.0 以上
- npm 9.0.0 以上
- Supabase CLI 2.22.12 以上（推奨: 最新版）
- Docker Desktop（Supabase ローカル開発用）

### 初回セットアップ
```bash
# リポジトリクローン
git clone [repository-url] delax-unified-pm
cd delax-unified-pm

# 依存関係インストール
npm install

# 開発環境ステータス確認
npm run env:status

# Supabase環境起動（必要に応じて）
npm run env:supabase:start
```

## 開発ワークフロー

### 1. 通常の開発フロー

```bash
# 全システム同時開発（推奨）
npm run env:dev:all

# または個別開発
npm run dev:pmlibrary    # PMLibraryのみ
npm run dev:pmplatto     # PMPlattoのみ
npm run dev:shared       # 共通パッケージのみ
```

### 2. 差分確認とコード共通化

```bash
# アプリ間の差分確認
npm run env:diff:apps

# 詳細な差分確認
npm run env:diff:apps -- --detailed

# Supabaseスキーマ差分確認
npm run env:diff:schemas
```

### 3. データベース作業

```bash
# PMPlattoスキーマ移行（Dry Run）
npm run migrate:pmplatto:dry

# PMPlattoスキーマ移行（本番実行）
npm run migrate:pmplatto YOUR_PROJECT_REF
```

## プロジェクト構造

```
delax-unified-pm/
├── apps/
│   ├── pmlibrary/          # PMLibrary（第2世代）
│   └── pmplatto/           # PMPlatto（第1世代）
├── packages/
│   ├── shared-types/       # 共通型定義
│   ├── supabase-client/    # Supabase共通クライアント
│   └── shared-ui/          # 共通UIコンポーネント（今後）
├── supabase/
│   └── pmplatto/          # PMPlattoスキーマ移行用
├── scripts/
│   ├── dev-environment.sh  # 統合開発環境管理
│   └── migrate-pmplatto.sh # PMPlattoスキーマ移行
└── docs/                  # ドキュメント
```

## チーム開発のベストプラクティス

### 共通パッケージの変更
1. `packages/shared-types` で型定義を更新
2. 両アプリでの影響確認
3. 段階的に適用

### 新機能開発
1. 必要に応じて共通パッケージから開始
2. 一方のアプリで実装・テスト
3. もう一方のアプリに適用検討

### データベーススキーマ変更
1. ローカル環境でテスト
2. 移行スクリプト作成
3. 段階的デプロイ

## 運用改善ツール

### 開発効率化
- **並列開発**: 両アプリ + 共通パッケージを同時開発
- **ホットリロード**: 共通パッケージ変更の自動反映
- **差分管理**: アプリ間の違いを可視化

### コード品質
- **統一スタイル**: ESLint + Prettier設定
- **型安全性**: TypeScript + shared-types
- **テスト自動化**: 各パッケージでのテスト実行

### デプロイメント
- **段階的デプロイ**: 各アプリ独立したデプロイ
- **安全な移行**: バックアップ + ロールバック手順
- **監視**: 移行後の動作確認

## トラブルシューティング

### よくある問題

#### 1. Turboが見つからない
```bash
# グローバルインストールされていない場合
npx turbo run dev --filter=pmlibrary
```

#### 2. Supabase接続エラー
```bash
# Docker確認
docker ps

# Supabase再起動
npm run env:supabase:stop
npm run env:supabase:start
```

#### 3. 共通パッケージの変更が反映されない
```bash
# ビルドキャッシュクリア
npm run clean
npm install
```

#### 4. ポート競合
- PMLibrary: http://localhost:5173
- PMPlatto: http://localhost:5174
- PMLibrary Supabase: http://localhost:54322
- PMPlatto Supabase: http://localhost:54321

### 開発環境リセット
```bash
# 完全クリーンアップ
npm run env:clean
npm install
npm run env:supabase:start
```

## チーム間連携

### PMLibraryチーム
- 新機能の開発と実装
- 共通パッケージの定義
- PMPlattoへの機能提供

### PMPlattoチーム  
- PMLibrary機能の適用
- 独自要件の開発
- 運用フィードバック

### 共通作業
- 型定義の統一
- UIコンポーネントの共通化
- データベーススキーマの統一

## 次のステップ

### Phase 1（現在）: 基盤整備
- [x] モノレポ環境構築
- [x] PMPlattoスキーマ移行準備
- [ ] PMPlattoスキーマ移行実行
- [ ] 統合テスト

### Phase 2: 機能統合
- [ ] PMPlattoフロントエンド更新
- [ ] 共通UIコンポーネント作成
- [ ] 新機能の実装

### Phase 3: 最適化
- [ ] パフォーマンス最適化
- [ ] 運用改善
- [ ] 統合完了

## 参考資料

- [PM統合開発方針.md](../PM統合開発方針.md)
- [Implementation Plan](./implementation-plan.md)
- [Automation Research](./automation-research.md)
- [PMPlatto Migration Checklist](./pmplatto-migration-checklist.md)

## サポート

開発中に問題が発生した場合：

1. **ドキュメント確認**: このガイドとreference資料
2. **環境確認**: `npm run env:status`
3. **ログ確認**: 各サービスのコンソール出力
4. **チーム相談**: Slack / Teams でサポート依頼

---

**最終更新**: 2025-07-31
**バージョン**: 1.0.0