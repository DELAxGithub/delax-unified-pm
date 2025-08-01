#!/bin/bash

# 統合開発環境管理スクリプト
# PMLibraryとPMPlattoの効率的な同時開発をサポート

set -e

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

# 使用方法表示
show_usage() {
    echo "統合開発環境管理スクリプト"
    echo ""
    echo "使用方法:"
    echo "  $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  dev:all           両アプリ + 共通パッケージの同時開発"
    echo "  dev:pmlibrary     PMLibraryのみ開発"
    echo "  dev:pmplatto      PMPlattoのみ開発" 
    echo "  dev:shared        共通パッケージのみ開発"
    echo "  supabase:start    両環境のSupabase起動"
    echo "  supabase:stop     両環境のSupabase停止"
    echo "  supabase:reset    開発環境リセット"
    echo "  diff:apps         アプリ間差分確認"
    echo "  diff:schemas      Supabaseスキーマ差分確認"
    echo "  status            開発環境ステータス確認"
    echo "  clean             開発環境クリーンアップ"
    echo ""
    echo "Examples:"
    echo "  $0 dev:all                    # 全システム同時起動"
    echo "  $0 dev:pmlibrary --hot-reload # PMLibraryをホットリロードで起動"
    echo "  $0 diff:apps --detailed       # 詳細な差分表示"
}

# 開発環境ステータス確認
check_status() {
    log_info "開発環境ステータス確認中..."
    
    echo ""
    echo "📦 パッケージ状況:"
    
    # PMLibrary
    if [ -d "apps/pmlibrary" ]; then
        echo "  ✅ PMLibrary: 利用可能"
    else
        echo "  ❌ PMLibrary: 見つかりません"
    fi
    
    # PMPlatto
    if [ -d "apps/pmplatto" ]; then
        echo "  ✅ PMPlatto: 利用可能"  
    else
        echo "  ❌ PMPlatto: 見つかりません"
    fi
    
    # 共通パッケージ
    if [ -d "packages/shared-types" ]; then
        echo "  ✅ Shared Types: 利用可能"
    else
        echo "  ❌ Shared Types: 見つかりません"
    fi
    
    if [ -d "packages/supabase-client" ]; then
        echo "  ✅ Supabase Client: 利用可能"
    else
        echo "  ❌ Supabase Client: 見つかりません"
    fi
    
    echo ""
    echo "🗄️ Supabase環境:"
    
    # PMLibrary Supabase
    if [ -f "apps/pmlibrary/supabase-cli" ]; then
        echo "  ✅ PMLibrary Supabase: 設定済み"
    else
        echo "  ⚠️  PMLibrary Supabase: 設定確認が必要"
    fi
    
    # PMPlatto Supabase
    if [ -d "supabase/pmplatto" ]; then
        echo "  ✅ PMPlatto Supabase: 設定済み"
    else
        echo "  ❌ PMPlatto Supabase: 見つかりません"
    fi
    
    echo ""
    echo "🔧 開発ツール:"
    
    # Node.js
    if command -v node &> /dev/null; then
        echo "  ✅ Node.js: $(node --version)"
    else
        echo "  ❌ Node.js: インストールされていません"
    fi
    
    # Turbo
    if command -v turbo &> /dev/null; then
        echo "  ✅ Turbo: $(turbo --version)"
    else
        echo "  ❌ Turbo: インストールされていません"
    fi
    
    # Supabase CLI
    if command -v supabase &> /dev/null; then
        echo "  ✅ Supabase CLI: $(supabase --version | head -1)"
    else
        echo "  ❌ Supabase CLI: インストールされていません"
    fi
}

# 全システム同時開発
dev_all() {
    log_info "全システム同時開発環境を起動中..."
    
    # 並列実行でパフォーマンス最適化
    log_info "共通パッケージ、PMLibrary、PMPlattoを並列起動"
    
    # tmuxやconcurrentlyが利用可能かチェック
    if command -v concurrently &> /dev/null; then
        concurrently \
            --names "Shared,PMLib,PMPlat" \
            --prefix-colors "cyan,yellow,green" \
            "npm run dev --workspace=packages/shared-types" \
            "npm run dev --workspace=apps/pmlibrary" \
            "npm run dev --workspace=apps/pmplatto"
    else
        log_warning "concurrently が見つかりません。個別起動を推奨："
        echo "  npm install -g concurrently"
        echo "  または個別に起動："
        echo "    Terminal 1: npm run dev:shared"  
        echo "    Terminal 2: npm run dev:pmlibrary"
        echo "    Terminal 3: npm run dev:pmplatto"
    fi
}

# アプリ間差分確認
diff_apps() {
    log_info "PMLibrary と PMPlatto の差分確認中..."
    
    DETAILED="${1:-false}"
    
    echo ""
    echo "📁 ディレクトリ構造比較:"
    
    # ディレクトリ構造の比較
    if [ "$DETAILED" = "--detailed" ]; then
        echo "PMLibrary構造:"
        find apps/pmlibrary/src -type f -name "*.tsx" -o -name "*.ts" | head -20
        echo ""
        echo "PMPlatto構造:"
        find apps/pmplatto/src -type f -name "*.tsx" -o -name "*.ts" | head -20
    else
        echo "PMLibrary: $(find apps/pmlibrary/src -type f -name "*.tsx" -o -name "*.ts" | wc -l) ファイル"
        echo "PMPlatto: $(find apps/pmplatto/src -type f -name "*.tsx" -o -name "*.ts" | wc -l) ファイル"
    fi
    
    echo ""
    echo "📋 共通化候補の分析:"
    
    # 類似ファイル名の検出
    echo "類似コンポーネント:"
    for file in apps/pmlibrary/src/components/*.tsx; do
        filename=$(basename "$file")
        if [ -f "apps/pmplatto/src/components/$filename" ]; then
            echo "  🔄 $filename (両方に存在)"
        fi
    done
    
    echo ""
    echo "📊 パッケージ依存関係比較:"
    echo "PMLibrary dependencies:"
    cat apps/pmlibrary/package.json | jq '.dependencies | keys[]' 2>/dev/null | head -5 || echo "  jq が必要です"
    echo "PMPlatto dependencies:"  
    cat apps/pmplatto/package.json | jq '.dependencies | keys[]' 2>/dev/null | head -5 || echo "  jq が必要です"
}

# Supabase スキーマ差分確認
diff_schemas() {
    log_info "Supabase スキーマ差分確認中..."
    
    # PMLibrary スキーマ
    if [ -f "apps/pmlibrary/supabase/migrations" ]; then
        echo "PMLibrary migrations:"
        ls -la apps/pmlibrary/supabase/migrations/ | tail -5
    else
        echo "PMLibrary migrations: 見つかりません"  
    fi
    
    echo ""
    
    # PMPlatto スキーマ
    if [ -d "supabase/pmplatto" ]; then
        echo "PMPlatto migrations:"
        ls -la supabase/pmplatto/
    else
        echo "PMPlatto migrations: 見つかりません"
    fi
    
    echo ""
    echo "📋 スキーマ移行状況:"
    echo "  PMPlatto → PMLibrary level: 準備完了"
    echo "  移行スクリプト: supabase/pmplatto/002_upgrade_to_pmlibrary.sql"
    echo "  ロールバック: supabase/pmplatto/003_rollback_procedure.sql"
}

# Supabase 環境管理
manage_supabase() {
    command="$1"
    
    case $command in
        "start")
            log_info "Supabase 開発環境を起動中..."
            
            # PMPlatto環境
            if [ -d "supabase/pmplatto" ]; then
                log_info "PMPlatto Supabase 起動中 (Port: 54321)"
                cd supabase/pmplatto && supabase start && cd ../..
            fi
            
            # PMLibrary環境  
            if [ -f "apps/pmlibrary/supabase-cli" ]; then
                log_info "PMLibrary Supabase 起動中 (Port: 54322)"
                cd apps/pmlibrary && ./supabase-cli start && cd ../..
            fi
            ;;
            
        "stop")
            log_info "Supabase 開発環境を停止中..."
            supabase stop --all
            ;;
            
        "reset")
            log_warning "Supabase 開発環境をリセット中..."
            log_warning "これにより開発データが失われます。続行しますか？ (y/N)"
            read -r confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                supabase db reset
                log_success "開発環境リセット完了"
            else
                log_info "リセットを中止しました"
            fi
            ;;
    esac
}

# 開発環境クリーンアップ
clean_environment() {
    log_info "開発環境をクリーンアップ中..."
    
    # Node modules クリーンアップ
    log_info "Node modules クリーンアップ"
    find . -name "node_modules" -type d -prune -exec rm -rf {} +
    
    # Build artifacts クリーンアップ
    log_info "Build artifacts クリーンアップ"
    find . -name "dist" -type d -prune -exec rm -rf {} +
    find . -name ".turbo" -type d -prune -exec rm -rf {} +
    
    # Supabase停止
    log_info "Supabase環境停止"
    supabase stop --all 2>/dev/null || true
    
    log_success "クリーンアップ完了。npm install で環境を再構築してください"
}

# メイン処理
main() {
    case "${1:-}" in
        "dev:all")
            dev_all
            ;;
        "dev:pmlibrary")
            log_info "PMLibrary開発環境起動中..."
            npm run dev --workspace=apps/pmlibrary
            ;;
        "dev:pmplatto")
            log_info "PMPlatto開発環境起動中..."
            npm run dev --workspace=apps/pmplatto
            ;;
        "dev:shared")
            log_info "共通パッケージ開発環境起動中..."
            npm run dev --workspace=packages/shared-types
            ;;
        "supabase:start")
            manage_supabase "start"
            ;;
        "supabase:stop")
            manage_supabase "stop"
            ;;
        "supabase:reset")
            manage_supabase "reset"
            ;;
        "diff:apps")
            diff_apps "${2:-}"
            ;;
        "diff:schemas")
            diff_schemas
            ;;
        "status")
            check_status
            ;;
        "clean")
            clean_environment
            ;;
        "--help"|"-h"|"")
            show_usage
            ;;
        *)
            log_error "未知のコマンド: $1"
            show_usage
            exit 1
            ;;
    esac
}

# スクリプト実行
main "$@"