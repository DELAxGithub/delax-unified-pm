# データベースマイグレーションガイド

## Supabaseダッシュボードでの実行手順

### 1. SQL Editorを開く
1. Supabaseダッシュボード (https://supabase.com/dashboard) にログイン
2. プロジェクト（pfrzcteapmwufnovmmfc）を選択
3. 左側メニューから「SQL Editor」を選択

### 2. マイグレーションを順番に実行

以下の順番で各ファイルの内容をコピーして実行してください：

#### ステップ1: 基本テーブル作成
ファイル: `/supabase/migrations/20250311084508_mellow_wave.sql`
- programsテーブルの基本構造を作成
- RLS（Row Level Security）を有効化
- 認証ユーザー向けのポリシー設定

#### ステップ2: テーブル構造の調整
ファイル: `/supabase/migrations/20250311090312_plain_cell.sql`
- pr_textフィールドをpr_80text/pr_200textに分割
- 既存のテーブル構造を更新

#### ステップ3: カレンダータスク機能
ファイル: `/supabase/migrations/20250312153118_calm_jungle.sql`
- calendar_tasksテーブルを作成
- programsテーブルとの外部キー設定
- インデックスの作成

#### ステップ4: PR管理機能
ファイル: `/supabase/migrations/20250323235457_billowing_credit.sql`
- pr_completedフィールドを追加
- pr_due_dateフィールドを追加

### 3. 実行時の注意点

- 各SQLを実行する際、エラーが出ても「テーブルが既に存在する」というエラーなら無視してOK
- 実行後、「Success」メッセージが表示されることを確認
- すべてのマイグレーションが完了したら、Table Editorで確認

### 4. 確認方法

Table Editorで以下を確認：
- `programs` テーブルが存在し、必要なカラムがすべてある
- `calendar_tasks` テーブルが存在する
- RLSが有効になっている（鍵アイコンが表示される）

### 5. トラブルシューティング

エラーが発生した場合：
1. エラーメッセージを確認
2. 既にテーブルが存在する場合は、次のマイグレーションに進む
3. 権限エラーの場合は、プロジェクト設定を確認

## 次のステップ

マイグレーション完了後：
1. Netlifyの環境変数を設定（まだの場合）
2. アプリケーションで認証とデータ操作をテスト
3. 必要に応じてサンプルデータを投入