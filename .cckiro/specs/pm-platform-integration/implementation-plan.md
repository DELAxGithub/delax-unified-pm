# DELAxPM プラットフォーム化実装計画書

## 1. 実装計画概要

### 1.1 実装方針（2025年7月31日改訂）
**段階的ハイブリッド戦略**: 各チーム独立運用を維持しつつ、機能移植を効率化する段階的アプローチ

**改訂理由**: 
- 2025年7月31日の実証により、モノレポ統合の複雑さとリスクが明らかになった
- 単純な機能移植でも多数の設定トラブルが発生（Netlify依存関係、環境変数、リポジトリ管理等）
- 運用継続を最優先とし、段階的改善による安全なアプローチが適切と判断

### 1.2 フェーズ構成

**Phase 1: 現状維持 + 効率的機能移植（1-2ヶ月）**
- 各チーム独立運用を維持
- 機能移植プロセスの標準化・効率化
- 設定トラブル解決ナレッジの蓄積

**Phase 2: 選択的統合判断（2-3ヶ月後）**
- Phase 1の運用実績に基づく統合判断
- 高頻度移植機能のみ共通パッケージ化検討
- 各アプリの独立性維持

**Phase 3: データ駆動による最適化（将来計画）**
- 実測データに基づく最適戦略決定
- 必要に応じた真の統合基盤構築

## 2. Phase 1: 現状維持 + 効率的機能移植（1-2ヶ月）

### Week 1-2: 機能移植基盤整備

#### 実装方針変更（2025年7月31日）
**従来計画**: モノレポ環境構築
**新方針**: 各チーム独立運用維持 + 機能移植効率化

**変更理由**: 
- モノレポ統合の複雑さが実証された
- 設定トラブル（Netlify依存関係問題等）のリスクが高い
- 運用継続を最優先とする必要性が明確になった

#### Day 1-3: 設定トラブル解決ナレッジ蓄積
**目標**: 今日発生した問題の解決策を文書化

**実装タスク**:
1. **Netlify設定問題の対策集作成**
   ```markdown
   # Netlify設定トラブルシューティング
   
   ## 問題1: devDependenciesが本番で利用できない
   - 症状: tailwindcss, postcss, autoprefixer not found
   - 原因: NODE_ENV=productionでdevDependenciesが除外
   - 解決: 必要パッケージをdependenciesに移動
   
   ## 問題2: 環境変数が反映されない
   - 症状: Invalid API key等の環境変数エラー
   - 原因: .envのみではNetlifyで反映されない
   - 解決: netlify.tomlの[build.environment]に直接設定
   ```

2. **リポジトリ管理手順の明確化**
   ```markdown
   # リポジトリ管理手順
   
   ## PMPlatto作業時
   - 作業リポジトリ: delax-unified-pm/source-repos/PMplatto
   - デプロイリポジトリ: https://github.com/DELAxGithub/PMplatto.git
   - 注意: 必ずデプロイリポジトリへのpushが必要
   ```

3. **MCP/Supabase認証手順**
   ```markdown
   # テストユーザー管理
   - 本番用テストアカウント: test.user@pmplatto.dev / password123
   - MCPによる動的ユーザー作成手順の文書化
   ```

**成果物**:
- [ ] 設定トラブル解決ナレッジベース
- [ ] PMLibrary→PMPlatto機能移植チェックリスト
- [ ] リポジトリ管理手順書

#### Day 3-4: PMPlattoスキーマ分析・移行計画

**目標**: PMPlattoのSupabaseをPMLibraryレベルに更新する詳細計画

**実装タスク**:
1. **スキーマ差分分析**
   ```sql
   -- 001_schema_analysis.sql
   -- 現在のPMPlattoスキーマ確認
   \\d programs;
   
   -- PMLibraryとの差分リスト作成
   -- 追加が必要なテーブル: episodes, status_history, episode_statuses, calendar_tasks
   ```

2. **データ移行スクリプト作成**
   ```sql
   -- 002_upgrade_to_pmlibrary.sql
   -- 段階的スキーマ更新スクリプト
   -- データの整合性を保ちながら拡張
   ```

3. **移行検証環境構築**
   ```bash
   # テスト用Supabaseプロジェクト作成
   # 移行スクリプトの検証
   # ロールバック手順の確認
   ```

**成果物**:
- [ ] PMPlattoスキーマ移行計画書
- [ ] データ移行スクリプト
- [ ] 移行検証環境

#### Day 5: 共通パッケージ設計

**目標**: 共通パッケージの基本構造を設計・実装

**実装タスク**:
1. **shared-types パッケージ**
   ```typescript
   // packages/shared-types/src/program.ts
   export interface Program {
     id: string;
     program_id: string;
     title: string;
     status: string;
     // PMLibraryベースの完全な型定義
   }
   
   // PMPlattoとPMLibraryの型の統合
   ```

2. **supabase-client パッケージ**
   ```typescript
   // packages/supabase-client/src/client.ts
   // 共通のSupabaseクライアント設定
   // 環境別の設定管理
   ```

3. **shared-ui パッケージ基盤**
   ```typescript
   // packages/shared-ui/src/components/Button.tsx
   // 基本的なUIコンポーネント
   // PMLibraryのコンポーネントを共通化
   ```

**成果物**:
- [ ] shared-types パッケージ（基本版）
- [ ] supabase-client パッケージ（基本版） 
- [ ] shared-ui パッケージ（基本版）

### Week 2: PMPlattoアップデート実装

#### Day 6-8: Supabaseスキーマ更新

**目標**: PMPlattoのSupabaseをPMLibraryレベルに更新

**実装タスク**:
1. **本番データのバックアップ**
   ```bash
   # PMPlattoの全データバックアップ
   supabase db dump --file pmplatto_backup_$(date +%Y%m%d).sql
   ```

2. **段階的スキーマ更新**
   ```sql
   -- Phase 1: 既存programsテーブル拡張
   ALTER TABLE programs ADD COLUMN IF NOT EXISTS series_name text;
   ALTER TABLE programs ADD COLUMN IF NOT EXISTS series_type text;
   ALTER TABLE programs ADD COLUMN IF NOT EXISTS season integer;
   ALTER TABLE programs ADD COLUMN IF NOT EXISTS total_episodes integer;
   
   -- Phase 2: 新規テーブル追加
   CREATE TABLE episodes (...);
   CREATE TABLE status_history (...);
   CREATE TABLE episode_statuses (...);
   CREATE TABLE calendar_tasks (...);
   ```

3. **既存データの移行**
   ```sql
   -- 既存programsデータを新スキーマに適合
   UPDATE programs SET 
     series_name = title,
     series_type = 'interview',
     season = 1,
     total_episodes = 1
   WHERE series_name IS NULL;
   ```

4. **整合性チェック**
   ```sql
   -- データ整合性の確認クエリ
   -- 移行前後のデータ件数比較
   -- 必須フィールドのNULLチェック
   ```

**成果物**:
- [ ] 更新されたPMPlattoSupabaseスキーマ
- [ ] データ移行完了確認
- [ ] ロールバック手順書

#### Day 9-10: PMPlattoフロントエンド更新

**目標**: PMLibraryのUI/UXをPMPlattoに適用

**実装タスク**:
1. **PMLibraryコンポーネントの移植**
   ```typescript
   // apps/pmplatto/src/components/
   // PMLibraryから主要コンポーネントをコピー・調整
   // - EpisodeKanbanBoard.tsx
   // - EpisodeListPage.tsx  
   // - TeamDashboard.tsx（新機能）
   ```

2. **Context・Hook の更新**
   ```typescript
   // apps/pmplatto/src/contexts/
   // PMLibraryのContext構造に更新
   // EpisodeContext.tsx 追加
   // CalendarTaskContext.tsx 追加
   ```

3. **新機能の統合**
   ```typescript
   // エピソード管理機能の追加
   // チームダッシュボード機能の追加
   // 週次レビュー機能の追加
   ```

4. **ルーティング更新**
   ```typescript
   // React Router の更新
   // PMLibraryの画面構成に合わせたルート追加
   ```

**成果物**:
- [ ] 更新されたPMPlattoフロントエンド
- [ ] 新機能（エピソード管理、チームダッシュボード）の動作確認
- [ ] PMLibraryとの機能パリティ確認

### Week 3: 統合テスト・調整

#### Day 11-13: 機能統合テスト

**目標**: アップデートされたPMPlattoの全機能をテスト

**実装タスク**:
1. **既存機能の回帰テスト**
   ```typescript
   // 基本的なプログラム管理機能
   // - 作成、編集、削除、一覧表示
   // - ステータス更新
   // - カレンダー表示
   ```

2. **新機能のテスト**
   ```typescript
   // エピソード管理機能
   // - エピソード一覧、カンバンボード
   // - ステータス履歴
   // チームダッシュボード
   // - 各ウィジェットの動作
   ```

3. **データ整合性テスト**
   ```sql
   -- 移行データの整合性確認
   -- RLS（Row Level Security）の動作確認
   -- トリガー・関数の動作確認
   ```

4. **パフォーマンステスト**
   ```bash
   # ページロード時間測定
   # API応答時間測定
   # 大量データでの動作確認
   ```

**成果物**:
- [ ] 機能テスト完了報告書
- [ ] パフォーマンステスト結果
- [ ] 問題点リストと対応状況

#### Day 14-15: 本番デプロイ準備

**目標**: 本番環境への安全なデプロイ準備

**実装タスク**:
1. **ステージング環境デプロイ**
   ```bash
   # ステージング環境での最終確認
   npm run build
   npm run deploy:staging
   # URL: https://pmplatto-staging.netlify.app
   ```

2. **本番デプロイ手順書作成**
   ```markdown
   ## 本番デプロイ手順
   1. 現在の本番環境のバックアップ
   2. Blue-Green デプロイメント実行
   3. DNS切り替え
   4. 動作確認
   5. 必要に応じてロールバック
   ```

3. **ロールバック手順の最終確認**
   ```bash
   # ロールバックスクリプトのテスト
   # データベースロールバック手順の確認
   ```

**成果物**:
- [ ] ステージング環境での動作確認完了
- [ ] 本番デプロイ手順書
- [ ] ロールバック手順書

### Week 4: 本番移行・運用開始

#### Day 16-18: 本番デプロイ実行

**目標**: PMPlattoの本番環境アップデート完了

**実装タスク**:
1. **本番デプロイ実行**
   ```bash
   # Blue-Green デプロイメント
   # 1. Green環境（新バージョン）にデプロイ
   npm run deploy:production:green
   
   # 2. DNS切り替え（段階的）
   # 3. 動作確認
   # 4. Blue環境を待機状態に
   ```

2. **動作確認**
   ```checklist
   - [ ] ログイン機能
   - [ ] プログラム管理機能
   - [ ] エピソード管理機能（新機能）
   - [ ] チームダッシュボード（新機能）
   - [ ] カレンダー機能
   - [ ] パフォーマンス確認
   ```

3. **ユーザー案内**
   ```markdown
   # PMPlatto アップデート完了のお知らせ
   - 新機能の説明
   - 変更点の案内
   - 問い合わせ先
   ```

**成果物**:
- [ ] 本番環境アップデート完了
- [ ] 動作確認完了
- [ ] ユーザー向け案内資料

#### Day 19-20: 運用開始・フィードバック収集

**目標**: 両チームの運用開始とフィードバック収集

**実装タスク**:
1. **運用監視**
   ```bash
   # ログ監視
   # エラー監視
   # パフォーマンス監視
   ```

2. **フィードバック収集システム**
   ```typescript
   // 簡易フィードバック機能
   interface Feedback {
     user: string;
     category: 'bug' | 'feature_request' | 'improvement';
     description: string;
     priority: 'low' | 'medium' | 'high';
   }
   ```

3. **第1週運用レポート作成**
   ```markdown
   ## Phase 1 完了レポート
   - 実装完了項目
   - 発見された問題と対応
   - 各チームからのフィードバック
   - Phase 2 計画の調整
   ```

**成果物**:
- [ ] 安定運用確認
- [ ] フィードバック収集開始
- [ ] Phase 1 完了レポート

## 3. Phase 2: 運用改善基盤構築（継続的）

### 3.1 開発効率化ツール実装

**継続的実装項目**:

1. **ホットリロード開発環境**
   ```bash
   # 目標: 開発効率の向上
   npm run dev:pmlibrary    # PMLibrary専用開発サーバー
   npm run dev:pmplatto     # PMPlatto専用開発サーバー
   npm run dev:shared       # 共通パッケージ + 両アプリ同時起動
   ```

2. **差分管理システム**
   ```typescript
   // 目標: 両アプリ間の変更管理
   interface AppDifference {
     componentName: string;
     syncStatus: 'in_sync' | 'pmplatto_behind' | 'conflicts';
     lastSyncDate: Date;
   }
   ```

3. **自動同期スクリプト**
   ```bash
   # 目標: 共通アップデートの効率的適用
   ./scripts/sync-common-updates.sh
   # PMLibraryの変更をPMPlattoに適用
   ```

### 3.2 チーム間連携支援

**継続的実装項目**:

1. **改善要望管理システム**
   ```typescript
   // 各チームからの改善要望を管理
   interface ImprovementRequest {
     requestedBy: 'pmlibrary_team' | 'pmplatto_team';
     priority: 'low' | 'medium' | 'high';
     affectsOtherTeam: boolean;
   }
   ```

2. **共通化候補の特定**
   ```typescript
   // 両アプリで似た機能の特定と共通化計画
   interface SharedComponent {
     currentStatus: 'custom' | 'shared' | 'pending_migration';
     migrationPlan?: MigrationPlan;
   }
   ```

## 4. Phase 3: 統合基盤再構築（将来計画）

### 4.1 実装計画概要

**Phase 2の運用実績を基に実装**:
- 真のマルチテナント基盤
- 3クリック自動セットアップ機能
- 高度な分析・レポート機能
- 統合管理ダッシュボード

### 4.2 トリガー条件

**Phase 3開始の条件**:
- [ ] Phase 1, 2の安定運用（6ヶ月以上）
- [ ] 両チームからの統合基盤への具体的ニーズ
- [ ] 新しい番組プロジェクトの立ち上げ予定
- [ ] 共通化によるコスト削減効果の定量化

## 5. リスク管理・品質保証

### 5.1 技術的リスク対策

1. **データ移行失敗のリスク**
   - 対策: 段階的移行 + 完全バックアップ
   - 検証: テスト環境での事前検証

2. **パフォーマンス劣化のリスク**
   - 対策: 事前ベンチマーク + 監視システム
   - 検証: 負荷テスト実施

3. **互換性問題のリスク**
   - 対策: 段階的アップデート + 回帰テスト
   - 検証: 全機能の動作確認

### 5.2 運用リスク対策

1. **ユーザー混乱のリスク**
   - 対策: 事前案内 + 操作ガイド作成
   - 検証: ユーザーテスト実施

2. **チーム運用停止のリスク**
   - 対策: Blue-Green デプロイメント
   - 検証: 即座のロールバック手順

## 6. 成功指標・評価基準

### 6.1 Phase 1 成功指標

**技術指標**:
- [ ] PMPlattoのPMLibraryレベルアップデート完了
- [ ] データ移行時の損失: 0件
- [ ] システム停止時間: 1時間以内
- [ ] 全機能の動作確認: 100%完了

**運用指標**:
- [ ] 両チームの運用開始: 1週間以内
- [ ] 重大な問題報告: 0件
- [ ] ユーザー満足度: 既存レベル維持

### 6.2 Phase 2 継続評価指標

**開発効率指標**:
- 機能追加・修正の所要時間
- デプロイ頻度の向上
- 共通コンポーネント利用率

**品質指標**:
- バグ発生率の推移
- システム稼働率
- パフォーマンス指標

---

この実装計画書は、設計書に基づいて作成されました。
問題がないか確認をお願いします。