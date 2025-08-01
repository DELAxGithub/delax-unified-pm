# DELAxPM プラットフォーム化設計書

## 1. 設計概要

### 1.1 設計方針
PMLibrary（二代目）をコアシステムとして、PMPlatto（初代）を最新版にアップデートし、汎用プラットフォーム「DELAxPM」を構築する。

### 1.2 アーキテクチャ戦略（2025年7月31日改訂）
- **独立運用維持**: 各チーム独立運用を継続し、運用安定性を最優先
- **段階的機能移植**: PMLibrary機能のPMPlattoへの効率的移植
- **設定標準化**: 機能移植時の設定トラブル解決手順の標準化
- **データ駆動判断**: 運用実績に基づく統合可否の判断

**戦略変更理由**:
- 2025年7月31日実証により、モノレポ統合の技術的複雑さが明らかになった
- Netlify依存関係問題、環境変数設定、リポジトリ管理等の設定トラブルが頻発
- 単純な機能移植でさえ多数の調整が必要で、運用リスクが高いことが判明
- 各チームの独立性維持がより重要と判断

## 2. システムアーキテクチャ設計

### 2.1 独立運用アーキテクチャ設計（2025年7月31日改訂）

**従来計画**: モノレポ統合構成
**新方針**: 独立運用 + 機能移植効率化

```
独立運用構成:

PMLibrary（https://github.com/DELAxGithub/PMliberary）
├── 独立したリポジトリ・DB・ドメインで運用継続
├── 新機能開発・改善を継続
└── 機能移植用のエクスポート機能追加

PMPlatto（https://github.com/DELAxGithub/PMplatto）  
├── 独立したリポジトリ・DB・ドメインで運用継続
├── PMLibraryからの段階的機能移植
└── 移植時の設定標準化

delax-unified-pm（開発支援・ナレッジ管理用）
├── 機能移植手順書・テンプレート
├── 設定トラブル解決ナレッジベース
├── 移植効率測定・改善ツール
└── 将来統合判断のためのデータ収集
```

**アーキテクチャ変更理由**:
- モノレポ統合時の設定複雑性が実証された（2025年7月31日）
- 運用安定性が最優先であることが明確になった
- 段階的アプローチによるリスク最小化が適切

### 2.2 技術スタック設計

#### フロントエンド
- **モノレポ管理**: Turborepo
- **パッケージマネージャー**: pnpm
- **フレームワーク**: React 18 + TypeScript 5
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **UIライブラリ**: Shadcn/ui（共通コンポーネント）
- **状態管理**: React Context API + Zustand（複雑な状態）

#### バックエンド
- **Supabase**: PostgreSQL + Auth + Realtime + Edge Functions
- **データベース**: PostgreSQL（マルチテナント対応）
- **認証**: Supabase Auth
- **リアルタイム**: Supabase Realtime

#### インフラ
- **ホスティング**: Netlify（アプリ別設定）
- **CI/CD**: GitHub Actions + Turborepo
- **監視**: Supabase Dashboard + Netlify Analytics

## 3. データベース設計

### 3.1 PMPlattoスキーマ移行設計

#### Phase 1: スキーマ拡張
```sql
-- 既存PMPlattoのprogramsテーブルを拡張
ALTER TABLE programs ADD COLUMN IF NOT EXISTS series_name text;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS series_type text;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS season integer;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS total_episodes integer;

-- PMLibrary追加テーブルの作成
-- episodes, status_history, episode_statuses, calendar_tasks
```

#### Phase 2: データ移行
```sql
-- PMPlattoの既存programsデータを新しいスキーマに適合
UPDATE programs SET 
  series_name = title,
  series_type = 'interview',  -- デフォルト値
  season = 1,                 -- デフォルト値
  total_episodes = 1          -- デフォルト値
WHERE series_name IS NULL;
```

### 3.2 マルチテナント設計

#### テナント管理テーブル
```sql
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_code text UNIQUE NOT NULL,     -- 'pmlibrary', 'pmplatto', 'newshow'
  tenant_name text NOT NULL,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: テナント分離
CREATE POLICY "Tenant isolation" ON programs
  FOR ALL TO authenticated
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### 3.3 プラットフォーム管理テーブル
```sql
CREATE TABLE platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb,
  description text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE setup_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text NOT NULL,
  template_config jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

## 4. アプリケーション設計

### 4.1 PMLibrary（apps/pmlibrary）

#### 既存機能の完全保持
- 全ての既存機能をそのまま保持
- 独立したSupabaseプロジェクトで運用継続
- 共通パッケージの段階的導入

#### 運用改善機能
- ホットリロード対応開発環境
- 共通コンポーネントの段階的適用
- デプロイメント自動化

### 4.2 PMPlatto更新版（apps/pmplatto）

#### 更新内容
- PMLibraryのUI/UXコンポーネントを適用
- Supabaseスキーマを最新版に更新
- エピソード管理、チームダッシュボード機能を追加

#### データ移行戦略
1. 既存PMPlattoデータのバックアップ
2. スキーマ更新スクリプトの実行
3. データの段階的移行
4. 整合性チェックとテスト

#### 運用中改善への対応
- PMLibraryとの差分管理システム
- カスタマイズ部分の独立管理
- 共通アップデートの選択的適用

### 4.3 運用改善基盤設計

#### 共通アップデート管理
```typescript
interface CommonUpdate {
  id: string;
  type: 'feature' | 'bugfix' | 'ui' | 'security';
  title: string;
  description: string;
  affectedApps: ('pmlibrary' | 'pmplatto')[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedEffort: number;    // 時間単位
  dependencies: string[];     // 他のアップデートID
}
```

#### 段階的共通化戦略
```typescript
interface SharedComponent {
  name: string;
  currentStatus: 'custom' | 'shared' | 'pending_migration';
  usageInApps: {
    pmlibrary: boolean;
    pmplatto: boolean;
  };
  migrationPlan?: {
    phase: 1 | 2 | 3;
    estimatedEffort: number;
  };
}
```

## 5. 運用改善支援機能設計

### 5.1 開発効率化ツール

#### ホットリロード開発環境
```bash
# 各アプリの独立開発
npm run dev:pmlibrary    # PMLibrary開発サーバー
npm run dev:pmplatto     # PMPlatto開発サーバー

# 共通パッケージの同時開発
npm run dev:shared       # 共通パッケージ + 両アプリ同時起動
```

#### 差分管理システム
```typescript
interface AppDifference {
  componentName: string;
  pmlibrary: {
    version: string;
    lastModified: Date;
    customizations: string[];
  };
  pmplatto: {
    version: string;
    lastModified: Date;
    customizations: string[];
  };
  syncStatus: 'in_sync' | 'pmplatto_behind' | 'conflicts' | 'custom_divergence';
}
```

### 5.2 デプロイメント改善

#### CI/CDパイプライン最適化
- 変更されたアプリのみビルド・デプロイ
- 共通パッケージ変更時の影響範囲自動検出
- ステージング環境での自動テスト

#### ロールバック対応
- 1クリックでの前バージョンへの復帰
- データベーススキーマの安全なロールバック
- 段階的デプロイメント（カナリーリリース）

### 5.3 チーム間連携支援

#### 改善要望管理
```typescript
interface ImprovementRequest {
  id: string;
  requestedBy: 'pmlibrary_team' | 'pmplatto_team';
  category: 'feature' | 'ui_improvement' | 'performance' | 'bug_fix';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedEffort: number;
  affectsOtherTeam: boolean;
  status: 'pending' | 'in_development' | 'testing' | 'deployed';
}
```

## 6. UI/UX設計

### 6.1 共通デザインシステム（packages/shared-ui）

#### コンポーネント体系
```typescript
// 基本コンポーネント
export { Button } from './components/Button';
export { Input } from './components/Input';
export { Modal } from './components/Modal';
export { Card } from './components/Card';

// 複合コンポーネント
export { DataTable } from './components/DataTable';
export { KanbanBoard } from './components/KanbanBoard';
export { Calendar } from './components/Calendar';

// レイアウトコンポーネント
export { Layout } from './components/Layout';
export { Sidebar } from './components/Sidebar';
export { Header } from './components/Header';
```

### 6.2 レスポンシブデザイン
- **モバイルファースト**: 320px〜のサポート
- **ブレークポイント**: sm(640px), md(768px), lg(1024px), xl(1280px)
- **タッチ対応**: モバイルデバイスでの操作性向上

## 7. セキュリティ設計

### 7.1 認証・認可
- **Supabase Auth**: メール認証 + OAuth（Google, GitHub）
- **RLS**: テナント別データ分離
- **RBAC**: 役割ベースアクセス制御

```sql
-- ユーザー役割管理
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid REFERENCES tenants(id),
  role text NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at timestamptz DEFAULT now()
);
```

### 7.2 データ保護
- **暗号化**: データベース暗号化（Supabase標準）
- **バックアップ**: 日次自動バックアップ
- **監査ログ**: 重要操作の記録

## 8. パフォーマンス設計

### 8.1 フロントエンド最適化
- **コード分割**: アプリ別・ページ別の動的インポート
- **キャッシュ戦略**: React Query + Supabase Realtime
- **バンドル最適化**: Vite + Tree shaking

### 8.2 データベース最適化
- **インデックス戦略**: 検索・絞り込み項目の最適化
- **クエリ最適化**: N+1問題の回避
- **接続プール**: Supabase Connection Pooling

## 9. テスト戦略

### 9.1 テスト体系
```
├── Unit Tests           # Jest + React Testing Library
├── Integration Tests    # Playwright（API連携）
├── E2E Tests           # Playwright（ユーザーフロー）
└── Visual Tests        # Chromatic（UI回帰テスト）
```

### 9.2 CI/CDテストフロー
1. **Lint & Type Check**: ESLint + TypeScript
2. **Unit Tests**: 各パッケージ・アプリ個別実行
3. **Integration Tests**: Supabase連携テスト
4. **E2E Tests**: 主要ユーザーフローの検証
5. **Visual Tests**: UIコンポーネントの変更検出

## 10. デプロイメント設計

### 10.1 Blue-Greenデプロイメント
```
Production Environment:
├── Blue (current)       # 現在の本番環境
└── Green (standby)      # 新バージョン環境

Migration Process:
1. Green環境にデプロイ
2. データベース移行（段階的）
3. DNS切り替え
4. Blue環境を待機状態に
```

### 10.2 ロールバック戦略
- **即座のDNS切り替え**: 1分以内でのロールバック
- **データベースロールバック**: マイグレーション逆実行
- **アプリケーションロールバック**: 前バージョンへの即座切り替え

---

この設計書は、要件定義書に基づいて作成されました。
問題がないか確認をお願いします。