#!/bin/bash

# PMPlatto Schema Migration Script
# PMPlattoのSupabaseスキーマをPMLibraryレベルに安全に更新する

set -e  # エラー時に停止

# 色付きログ関数
log_info() {
    echo -e "\033[34m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[32m[SUCCESS]\033[0m $1"
}

log_warning() {
    echo -e "\033[33m[WARNING]\033[0m $1"
}

log_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

# 設定
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
SUPABASE_PROJECT_REF="${1:-}"
DRY_RUN="${2:-false}"

# 引数チェック
if [ -z "$SUPABASE_PROJECT_REF" ]; then
    log_error "使用方法: $0 <SUPABASE_PROJECT_REF> [dry-run]"
    log_error "例: $0 abcdefghijklmnop"
    log_error "例: $0 abcdefghijklmnop dry-run  # テスト実行"
    exit 1
fi

log_info "PMPlatto Schema Migration開始"
log_info "プロジェクト参照: $SUPABASE_PROJECT_REF"
log_info "実行モード: $([ "$DRY_RUN" = "true" ] && echo "DRY RUN (テスト)" || echo "本番実行")"

# 1. 事前確認
log_info "Step 1: 事前確認"

# Supabase CLIの確認
if ! command -v supabase &> /dev/null; then
    log_error "Supabase CLIがインストールされていません"
    log_error "インストール: npm install -g supabase"
    exit 1
fi

# プロジェクト接続確認
log_info "Supabaseプロジェクトに接続中..."
if ! supabase projects list | grep -q "$SUPABASE_PROJECT_REF"; then
    log_error "プロジェクト $SUPABASE_PROJECT_REF に接続できません"
    log_error "supabase login でログインしてください"
    exit 1
fi

log_success "Supabaseプロジェクト接続確認OK"

# 2. バックアップ作成
log_info "Step 2: データベースバックアップ作成"

if [ "$DRY_RUN" != "true" ]; then
    mkdir -p "$BACKUP_DIR"
    
    log_info "データベース全体をバックアップ中..."
    supabase db dump --project-ref "$SUPABASE_PROJECT_REF" --file "$BACKUP_DIR/pmplatto_full_backup.sql"
    
    log_info "スキーマのみをバックアップ中..."
    supabase db dump --project-ref "$SUPABASE_PROJECT_REF" --schema-only --file "$BACKUP_DIR/pmplatto_schema_backup.sql"
    
    log_success "バックアップ完了: $BACKUP_DIR"
else
    log_warning "DRY RUN: バックアップをスキップ"
fi

# 3. 移行前状態確認
log_info "Step 3: 移行前状態確認"

# 既存テーブルの確認
log_info "既存テーブル構成を確認中..."
EXISTING_TABLES=$(supabase db exec --project-ref "$SUPABASE_PROJECT_REF" --file - <<SQL
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
SQL
)

log_info "現在のテーブル:"
echo "$EXISTING_TABLES"

# programs テーブルの現在のフィールド確認
log_info "programs テーブルの現在の構成:"
PROGRAMS_COLUMNS=$(supabase db exec --project-ref "$SUPABASE_PROJECT_REF" --file - <<SQL
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'programs' AND table_schema = 'public'
ORDER BY ordinal_position;
SQL
)
echo "$PROGRAMS_COLUMNS"

# データ件数確認
log_info "現在のデータ件数:"
DATA_COUNTS=$(supabase db exec --project-ref "$SUPABASE_PROJECT_REF" --file - <<SQL
SELECT 
  'programs' as table_name, COUNT(*) as count FROM programs
UNION ALL
SELECT 
  'calendar_tasks' as table_name, COUNT(*) as count FROM calendar_tasks;
SQL
)
echo "$DATA_COUNTS"

# 4. 移行スクリプト実行
log_info "Step 4: スキーマ移行実行"

if [ "$DRY_RUN" = "true" ]; then
    log_warning "DRY RUN: 移行スクリプトの構文チェックのみ実行"
    
    # 移行スクリプトの構文チェック
    if supabase db exec --project-ref "$SUPABASE_PROJECT_REF" --dry-run --file supabase/pmplatto/002_upgrade_to_pmlibrary.sql; then
        log_success "移行スクリプトの構文チェックOK"
    else
        log_error "移行スクリプトに構文エラーがあります"
        exit 1
    fi
else
    log_warning "本番データベースの移行を開始します。続行しますか？ (y/N)"
    read -r confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log_info "移行を中止しました"
        exit 0
    fi
    
    log_info "スキーマ移行スクリプトを実行中..."
    if supabase db exec --project-ref "$SUPABASE_PROJECT_REF" --file supabase/pmplatto/002_upgrade_to_pmlibrary.sql; then
        log_success "スキーマ移行完了"
    else
        log_error "スキーマ移行に失敗しました"
        log_error "バックアップからの復旧を検討してください: $BACKUP_DIR"
        exit 1
    fi
fi

# 5. 移行後確認
log_info "Step 5: 移行後確認"

if [ "$DRY_RUN" != "true" ]; then
    # 新しいテーブルの確認
    log_info "移行後のテーブル構成:"
    NEW_TABLES=$(supabase db exec --project-ref "$SUPABASE_PROJECT_REF" --file - <<SQL
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
SQL
)
    echo "$NEW_TABLES"
    
    # programs テーブルの新しいフィールド確認
    log_info "programs テーブルの更新後構成:"
    NEW_PROGRAMS_COLUMNS=$(supabase db exec --project-ref "$SUPABASE_PROJECT_REF" --file - <<SQL
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'programs' AND table_schema = 'public'
ORDER BY ordinal_position;
SQL
)
    echo "$NEW_PROGRAMS_COLUMNS"
    
    # 整合性チェック実行
    log_info "データ整合性チェック実行中..."
    INTEGRITY_CHECK=$(supabase db exec --project-ref "$SUPABASE_PROJECT_REF" --file - <<SQL
-- 1. programs テーブルの新フィールド確認
SELECT 
  'programs_check' as check_name,
  COUNT(*) as total_programs,
  COUNT(series_name) as programs_with_series_name,
  COUNT(series_type) as programs_with_series_type,
  COUNT(season) as programs_with_season
FROM programs

UNION ALL

-- 2. episode_statuses テーブルの確認
SELECT 
  'episode_statuses_check' as check_name,
  COUNT(*) as status_count,
  NULL, NULL, NULL
FROM episode_statuses

UNION ALL

-- 3. 新テーブルの存在確認
SELECT 
  'new_tables_check' as check_name,
  COUNT(*) as table_count,
  NULL, NULL, NULL
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('episodes', 'status_history', 'episode_statuses');
SQL
)
    
    echo "$INTEGRITY_CHECK"
    
    # 成功判定
    if echo "$NEW_TABLES" | grep -q "episodes" && echo "$NEW_TABLES" | grep -q "status_history"; then
        log_success "✅ スキーマ移行が正常に完了しました！"
        log_success "バックアップ場所: $BACKUP_DIR"
        log_success "PMPlattoがPMLibraryレベルに更新されました"
    else
        log_error "❌ スキーマ移行で問題が発生しました"
        log_error "バックアップからの復旧を検討してください: $BACKUP_DIR"
        exit 1
    fi
else
    log_success "✅ DRY RUN完了: 移行スクリプトに問題ありません"
    log_info "本番実行する場合は、dry-run パラメータを除いて再実行してください"
fi

# 6. 次のステップの案内
log_info "Step 6: 次のステップ"
echo ""
echo "🎉 PMPlattoスキーマ移行完了！"
echo ""
echo "次に実行すべき作業:"
echo "1. PMPlattoフロントエンドのアップデート (PMLibraryのUI/UXを適用)"
echo "2. 新機能のテスト (エピソード管理、チームダッシュボード)"
echo "3. 既存機能の回帰テスト"
echo "4. ユーザー向け機能説明の準備"
echo ""
echo "開発コマンド:"
echo "  npm run dev:pmplatto  # PMPlattoの開発サーバー起動"
echo "  npm run build:pmplatto # PMPlattoのビルド"
echo ""

log_success "移行スクリプト実行完了"