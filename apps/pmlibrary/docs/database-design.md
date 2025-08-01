# LIBRARY エピソード進捗管理システム データベース設計仕様書

## 1. システム概要

LIBRARYの番組制作進捗を「すごろく式」で管理するシンプルなシステムです。インタビュー番組とVTR編集番組のエピソード単位での進捗を10段階のステータスで可視化し、手戻りにも対応します。

## 2. 管理対象

### 2.1 シーズン1
- **リベラルアーツインタビュー**：6エピソード（LA-INT001〜006）
  - 1エピソード = 1ゲスト×10分×6本
- **VTR「オリオンの会議室」**：15エピソード
  - 通常回：ORN-EP01〜12（各8分）
  - 特別編：ORN-SP01〜03（各8分）

### 2.2 シーズン2
- **同友会インタビュー**：5エピソード（DY-INT001〜005）
  - 1エピソード = 1ゲスト×30分×1本
- **VTR**：15エピソード
  - 通常回：S2-EP01〜12（各8分）
  - 特別編：S2-SP01〜03（各8分）

## 3. ステータスフロー

### 3.1 10段階のステータス
```
[台本作成中] → [素材準備] → [素材確定] → [編集中] → [試写1] 
→ [修正1] → [MA中] → [初稿完成] → [修正中] → [完パケ納品]
```

### 3.2 手戻りパターン
- 試写1 → 編集中
- 初稿完成 → 修正1 or MA中
- 修正中 → 編集中（大幅修正時）

## 4. データベース構造

### 4.1 episodes（エピソード管理テーブル）
主要テーブルとして、各エピソードの情報を管理します。

```sql
id              bigint PRIMARY KEY    -- 主キー
episode_id      text UNIQUE          -- エピソードID（LA-INT001等）
title           text NOT NULL        -- タイトル/テーマ
episode_type    text                 -- タイプ（interview/vtr）
season          integer              -- シーズン番号
episode_number  integer              -- エピソード番号

-- 共通項目
script_url      text                 -- 台本URL（Googleドキュメント）
current_status  text                 -- 現在のステータス
director        text                 -- 担当ディレクター
due_date        date                 -- 納期

-- インタビュー番組用
guest_name      text                 -- ゲスト名
recording_date  date                 -- 収録日
recording_location text              -- 収録場所

-- VTR番組用
material_status text                 -- 素材準備状況（○/△/×）

-- タイムスタンプ
created_at      timestamptz          -- 作成日時
updated_at      timestamptz          -- 更新日時
```

### 4.2 episode_statuses（ステータスマスター）
10段階のステータスを定義します。

```sql
id           serial PRIMARY KEY
status_name  text UNIQUE         -- ステータス名
status_order integer             -- 表示順序（1-10）
color_code   text                -- 表示色
created_at   timestamptz         -- 作成日時
```

### 4.3 status_history（ステータス変更履歴）
手戻りを含むステータス変更の履歴を記録します。

```sql
id            bigint PRIMARY KEY
episode_id    bigint REFERENCES episodes(id)
old_status    text                -- 変更前ステータス
new_status    text                -- 変更後ステータス
changed_by    uuid                -- 変更者
change_reason text                -- 変更理由（手戻り時）
changed_at    timestamptz         -- 変更日時
```

### 4.4 programs（シリーズ管理テーブル）
既存のprogramsテーブルに以下のフィールドを追加：

```sql
series_name    text                -- シリーズ名
series_type    text                -- シリーズタイプ（interview/vtr）
season         integer             -- シーズン番号
total_episodes integer             -- 総エピソード数
```

## 5. ビューとインデックス

### 5.1 episode_details ビュー
エピソードの詳細情報を集約したビューです。

```sql
CREATE VIEW episode_details AS
SELECT 
  e.*,
  es.status_order,
  es.color_code,
  p.series_name,
  CASE 
    WHEN e.due_date < CURRENT_DATE 
    AND e.current_status != '完パケ納品' 
    THEN true ELSE false
  END as is_overdue,
  CURRENT_DATE - e.due_date as days_overdue
FROM episodes e
LEFT JOIN episode_statuses es ON e.current_status = es.status_name
LEFT JOIN programs p ON p.season = e.season AND p.series_type = e.episode_type;
```

### 5.2 インデックス
パフォーマンス向上のため、以下のインデックスを作成：
- episode_id（一意性と検索性能）
- season（シーズン別フィルター）
- current_status（ステータス別フィルター）
- due_date（納期管理）
- episode_type（番組タイプ別フィルター）

## 6. セキュリティとトリガー

### 6.1 Row Level Security (RLS)
全テーブルでRLSを有効化し、認証ユーザーのみアクセス可能にします。

### 6.2 自動化トリガー
1. **updated_at更新トリガー**：エピソード更新時に自動的にタイムスタンプを更新
2. **ステータス変更記録トリガー**：ステータス変更時に自動的に履歴を記録

## 7. 実装計画

### 7.1 マイグレーション手順
1. 既存のprogramsテーブルにシリーズ管理フィールドを追加
2. 新規テーブル（episodes, episode_statuses, status_history）を作成
3. サンプルデータの投入（開発環境のみ）

### 7.2 UI実装計画
1. すごろく式進捗ビューの作成
2. ドラッグ&ドロップによるステータス更新
3. フィルター機能（シーズン/タイプ/担当者/ステータス）
4. CSVエクスポート機能

## 8. 使用例

### 8.1 インタビューエピソードの登録
```sql
-- 新規エピソードの登録
INSERT INTO episodes (
  episode_id, title, episode_type, season, episode_number,
  current_status, director, due_date,
  guest_name, recording_date, recording_location
) VALUES (
  'LA-INT001', 'ゲストA インタビュー', 'interview', 1, 1,
  '台本作成中', '田中ディレクター', '2025-02-01',
  'ゲストA', '2025-01-15', 'スタジオA'
);
```

### 8.2 ステータス更新（手戻りあり）
```sql
-- ステータスを「試写1」から「編集中」に戻す
UPDATE episodes 
SET current_status = '編集中'
WHERE episode_id = 'LA-INT001';

-- 手戻り理由を記録（トリガーで自動記録されるが、理由は手動で更新）
UPDATE status_history
SET change_reason = 'ゲストの追加要望により再編集'
WHERE episode_id = (SELECT id FROM episodes WHERE episode_id = 'LA-INT001')
AND changed_at = (SELECT MAX(changed_at) FROM status_history);
```

## 9. 今後の拡張予定

### 9.1 Phase 1（現在実装中）
- 基本的なエピソード管理
- すごろく式進捗表示
- ステータス変更と履歴管理

### 9.2 Phase 2（検討中）
- Googleドキュメント連携（台本URL自動取得）
- Slack通知（ステータス変更時）
- 詳細な分析ダッシュボード

## 10. 特記事項

1. **シンプル設計の維持**：複雑な機能は必要に応じて段階的に追加
2. **エピソード中心**：番組単位ではなくエピソード単位で管理
3. **手戻り対応**：制作現場の実態に合わせた柔軟なステータス管理
4. **モバイル対応**：外出先からも確認できるレスポンシブデザイン