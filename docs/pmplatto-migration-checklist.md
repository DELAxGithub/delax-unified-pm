# PMPlatto Schema Migration Checklist

## 移行前チェックリスト

### 1. 事前準備
- [ ] Supabase CLI 最新版の確認 (現在: v2.22.12, 推奨: v2.33.7)
- [ ] PMPlattoプロジェクトREFの確認
- [ ] 本番データベースの読み取り専用バックアップ作成
- [ ] チームメンバーへの移行予告通知
- [ ] メンテナンス時間の設定（推奨: 2-3時間）

### 2. 技術的準備
- [ ] 移行スクリプトの構文チェック完了
- [ ] ロールバック手順の確認
- [ ] 緊急連絡体制の確認
- [ ] 移行後テストシナリオの準備

### 3. データ確認
- [ ] 現在のprogram数の確認
- [ ] 現在のcalendar_tasks数の確認  
- [ ] 重要データの特定とマーキング
- [ ] データ損失リスクの評価

## 移行実行手順

### Phase 1: Dry Run テスト
```bash
# 構文チェックのみ実行
./scripts/migrate-pmplatto.sh YOUR_PROJECT_REF dry-run
```

### Phase 2: 本番移行実行
```bash
# 実際の移行実行
./scripts/migrate-pmplatto.sh YOUR_PROJECT_REF
```

### Phase 3: 移行後検証
- [ ] 新テーブル作成確認（episodes, status_history, episode_statuses）
- [ ] programs テーブル新フィールド確認
- [ ] calendar_tasks テーブル新フィールド確認
- [ ] 既存データの保持確認
- [ ] RLSポリシーの動作確認
- [ ] トリガーの動作確認

## 移行後作業

### 1. 機能テスト
- [ ] 既存プログラム表示の確認
- [ ] カレンダー機能の確認
- [ ] 新機能（エピソード管理）の基本動作確認
- [ ] 認証・認可の確認

### 2. パフォーマンステスト
- [ ] ページ読み込み速度の確認
- [ ] データベースクエリパフォーマンスの確認
- [ ] 同時接続テスト

### 3. ユーザー向け準備
- [ ] 新機能説明ドキュメントの作成
- [ ] ユーザー向けアナウンスの準備
- [ ] サポート体制の確認

## 緊急時対応

### ロールバック判断基準
- [ ] 既存データが失われた場合
- [ ] 重要機能が動作しない場合
- [ ] パフォーマンスが大幅に劣化した場合
- [ ] ユーザーがアクセスできない場合

### ロールバック手順
```bash
# オプション1: スクリプトによるロールバック
supabase db exec --project-ref YOUR_PROJECT_REF --file supabase/pmplatto/003_rollback_procedure.sql

# オプション2: バックアップからの完全復旧
supabase db reset --project-ref YOUR_PROJECT_REF
supabase db exec --project-ref YOUR_PROJECT_REF --file backups/YYYYMMDD_HHMMSS/pmplatto_full_backup.sql
```

## 移行成功判定基準

### 技術的成功基準
- [ ] 全ての新テーブルが正常に作成されている
- [ ] 既存データが100%保持されている
- [ ] 新フィールドがすべて追加されている
- [ ] インデックス・制約が正常に設定されている
- [ ] RLSポリシーが適用されている

### 機能的成功基準
- [ ] 既存機能が全て正常動作している
- [ ] 新機能（エピソード管理）にアクセス可能
- [ ] パフォーマンスが劣化していない
- [ ] ユーザーがログイン・操作可能

## 移行後の次ステップ

### Week 2 Day 9-10
- [ ] PMPlattoフロントエンドのPMLibrary UI/UX適用
- [ ] 新機能の実装とテスト
- [ ] ユーザー向けドキュメント作成

### Week 3
- [ ] 統合テストの実行
- [ ] パフォーマンス最適化
- [ ] ユーザーフィードバック収集

## 連絡先・リソース

### 技術サポート
- 開発チーム: [連絡先]
- インフラ担当: [連絡先]

### ドキュメント参照
- PM統合開発方針.md
- Implementation Plan (docs/implementation-plan.md)
- Automation Research (docs/automation-research.md)

## 移行実行ログ

### 実行日時
- 開始: 
- 完了: 
- 実行者: 

### 結果
- [ ] 成功
- [ ] 部分成功（詳細: ）
- [ ] 失敗（理由: ）

### 問題と対処
- 

### 改善点
- 