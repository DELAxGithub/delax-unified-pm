import { Program } from './program';

export interface CalendarTask {
  id: string;
  program_id: number | null;
  task_type: string;
  start_date: string;
  end_date: string;
  meeting_url?: string | null;
  description?: string | null;
  is_team_event?: boolean;
  created_at: string;
  updated_at: string;
  program?: Program;
}

export interface NewCalendarTask {
  program_id: number | null;
  task_type: string;
  start_date: string;
  end_date: string;
  meeting_url?: string | null;
  description?: string | null;
  is_team_event?: boolean;
}

export type UpdateCalendarTask = Partial<NewCalendarTask>;

// 通常タスクの種別
export const TASK_TYPE_PRESETS = [
  '編集',
  '試写',
  'MA',
] as const;

// チームイベントの種別
export const TEAM_EVENT_TYPES = [
  '🌐 全体会議',
  '💼 制作会議', 
  '🎬 スタジオ収録',
  '⚠️ 重要',
] as const;

export type TaskTypePreset = typeof TASK_TYPE_PRESETS[number];
export type TeamEventType = typeof TEAM_EVENT_TYPES[number];

// 通常タスク種別ごとの色設定
export const TASK_TYPE_COLORS: Record<TaskTypePreset, { bg: string; text: string; border: string }> = {
  '編集': { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-300' },
  'MA': { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300' },
  '試写': { bg: 'bg-green-100', text: 'text-green-900', border: 'border-green-300' },
};

// チームイベント種別ごとの色設定（目立つグラデーション）
export const TEAM_EVENT_COLORS: Record<TeamEventType, { bg: string; text: string; border: string; gradient: string }> = {
  '🌐 全体会議': { 
    bg: 'bg-blue-500', 
    text: 'text-white', 
    border: 'border-blue-600',
    gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
  },
  '💼 制作会議': { 
    bg: 'bg-green-500', 
    text: 'text-white', 
    border: 'border-green-600',
    gradient: 'linear-gradient(135deg, #10B981, #047857)'
  },
  '🎬 スタジオ収録': { 
    bg: 'bg-red-500', 
    text: 'text-white', 
    border: 'border-red-600',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)'
  },
  '⚠️ 重要': { 
    bg: 'bg-orange-500', 
    text: 'text-white', 
    border: 'border-orange-600',
    gradient: 'linear-gradient(135deg, #F97316, #EA580C)'
  },
};

// カスタムタスク種別のデフォルト色も改善
export const DEFAULT_TASK_COLOR = {
  bg: 'bg-gray-100',
  text: 'text-gray-900',
  border: 'border-gray-300'
};