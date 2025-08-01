# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Program Management System (プラッと進捗すごろく) for managing TV/media program production workflows. It's a React TypeScript application with Supabase backend, designed to track program progress from planning through broadcast completion.

## Essential Commands

```bash
# Install dependencies
npm install

# Run development server (starts on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview

# Execute weekly review (sends Slack notifications) - Legacy
npm run weekly-review

# Deploy Supabase Edge Functions
npx supabase functions deploy weekly-review
```

## Architecture Overview

### Frontend Stack
- **React 18** with TypeScript
- **Vite** as build tool
- **React Router v6** for routing
- **Tailwind CSS** for styling
- **React Context API** for state management
- **Supabase** for backend (auth, database, real-time)

### Key Directory Structure
- `/src/components/` - React components (ProgramList, KanbanBoard, Calendar, etc.)
- `/src/contexts/` - Context providers (AuthContext, ProgramContext, CalendarTaskContext)
- `/src/lib/` - Utilities and Supabase client configuration
- `/src/types/` - TypeScript type definitions
- `/supabase/migrations/` - Database migration files

### Core Features
1. **Program List** - Main view showing all programs with status tracking
2. **Kanban Board** - Drag-and-drop interface for visual progress management
3. **Calendar** - Schedule management for broadcasts, recordings, and reruns
4. **Weekly Review** - Automated Slack notifications every Monday at 10:00 AM

### Database Schema
Main tables:
- `programs` - Program information with 9 status levels
- `calendar_events` - Calendar entries for scheduling
- `clients` - Client/sponsor information
- `users` - User management with role-based access

### Program Status Flow
1. キャスティング中 (Casting)
2. ロケ済 (Location Complete)
3. VE済 (Video Editing Complete)
4. MA済 (Audio Mixing Complete)
5. 初号試写済 (First Preview Complete)
6. 局プレ済 (Station Preview Complete)
7. 完パケ済 (Final Package Complete)
8. OA済 (On Air Complete)
9. 請求済 (Billing Complete)

### Development Notes
- No test suite currently exists
- Authentication uses Supabase Auth with magic links
- Row Level Security (RLS) is enabled on all tables

### Environment Variables
Required for core functionality:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

Weekly review (Slack):
- `VITE_SLACK_WEBHOOK_URL` - Slack webhook URL for notifications (legacy script)
- `SLACK_WEBHOOK_URL` - Slack webhook URL for Edge Function

Weekly review (Email) - Edge Function:
- `EMAIL_SERVICE` - Email service (default: 'resend')
- `RESEND_API_KEY` - Resend API key for email sending
- `EMAIL_DOMAIN` - Domain for sending emails
- `REVIEW_EMAIL` - Recipient email address (e.g., h.kodera@gmail.com)
- `APP_BASE_URL` - Base URL for system links

Legacy email (Deprecated):
- `GMAIL_USER` - Gmail address for sending emails
- `GMAIL_APP_PASSWORD` - Gmail app password


## タスク実行の4段階フロー

### 1. 要件定義
- `.claude_workflow/complete.md`が存在すれば参照
- 目的の明確化、現状把握、成功基準の設定
- `.claude_workflow/requirements.md`に文書化
- **必須確認**: 「要件定義フェーズが完了しました。設計フェーズに進んでよろしいですか？」

### 2. 設計
- **必ず`.claude_workflow/requirements.md`を読み込んでから開始**
- アプローチ検討、実施手順決定、問題点の特定
- `.claude_workflow/design.md`に文書化
- **必須確認**: 「設計フェーズが完了しました。タスク化フェーズに進んでよろしいですか？」

### 3. タスク化
- **必ず`.claude_workflow/design.md`を読み込んでから開始**
- タスクを実行可能な単位に分解、優先順位設定
- `.claude_workflow/tasks.md`に文書化
- **必須確認**: 「タスク化フェーズが完了しました。実行フェーズに進んでよろしいですか？」

### 4. 実行
- **必ず`.claude_workflow/tasks.md`を読み込んでから開始**
- タスクを順次実行、進捗を`.claude_workflow/tasks.md`に更新
- 各タスク完了時に報告

## 実行ルール
### ファイル操作
- 新規タスク開始時: 既存ファイルの**内容を全て削除して白紙から書き直す**
- ファイル編集前に必ず現在の内容を確認

### フェーズ管理
- 各段階開始時: 「前段階のmdファイルを読み込みました」と報告
- 各段階の最後に、期待通りの結果になっているか確認
- 要件定義なしにいきなり実装を始めない

### 実行方針
- 段階的に進める: 一度に全てを変更せず、小さな変更を積み重ねる
- 複数のタスクを同時並行で進めない
- エラーは解決してから次へ進む
- エラーを無視して次のステップに進まない
- 指示にない機能を勝手に追加しない