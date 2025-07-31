# DELAx PM - 統合番組制作管理プラットフォーム

PMLibraryとPMPlattoを統合した汎用番組制作管理プラットフォーム

## 概要

DELAx PMは、番組制作における全工程を一元管理できるプラットフォームです。
PMLibraryの実績とPMPlattoの機能を統合し、新番組の迅速な立ち上げを実現します。

## 統合計画

### Phase 1: PMLibraryベースでのPMPlatto統合（3-4週間）
- 稼働中のPMLibraryを基盤として、PMPlattoの機能を統合
- 両システムの機能を持つ統合版の完成

### Phase 2: DELAxPMプラットフォーム化（2-3週間）
- 統合システムを汎用化
- 3クリックで新番組環境をセットアップできるプラットフォーム

## 開発方針

詳細は[PM統合開発方針.md](./PM統合開発方針.md)を参照してください。

## リポジトリ構成（予定）

```
DELAxPM/
├── apps/
│   ├── unified/          # 統合版アプリ
│   ├── pmlibrary/        # 既存PMLibrary（移行期間中）
│   └── pmplatto/         # 既存PMPlatto（移行期間中）
├── packages/
│   ├── shared-ui/        # 共通UIコンポーネント
│   ├── shared-types/     # TypeScript型定義
│   └── supabase-client/  # Supabase接続共通化
├── supabase/
│   ├── migrations/       # 統合スキーマ移行
│   └── functions/        # Edge Functions
└── deploy/
    ├── netlify-unified/  # 統合版デプロイ設定
    └── netlify-legacy/   # 既存版デプロイ設定
```

## ライセンス

TBD