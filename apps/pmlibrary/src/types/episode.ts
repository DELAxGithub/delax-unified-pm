export type EpisodeStatus = 
  | '台本作成中'
  | '素材準備'
  | '素材確定'
  | '編集中'
  | '試写1'
  | '修正1'
  | 'MA中'
  | '初稿完成'
  | '修正中'
  | '完パケ納品';

export type EpisodeType = 'interview' | 'vtr';
export type MaterialStatus = '○' | '△' | '×';

export interface EpisodeStatusInfo {
  id: number;
  status_name: EpisodeStatus;
  status_order: number;
  color_code: string;
  created_at: string;
}

export interface Episode {
  id: number;
  episode_id: string; // LA-INT001, ORN-EP01 など
  title: string;
  episode_type: EpisodeType;
  season: number;
  episode_number: number;
  
  // 共通項目
  script_url: string | null;
  current_status: EpisodeStatus;
  director: string | null;
  due_date: string | null;
  
  // インタビュー番組用
  guest_name: string | null;
  recording_date: string | null;
  recording_location: string | null;
  
  // VTR番組用  
  material_status: MaterialStatus | null;
  
  // タイムスタンプ
  created_at: string;
  updated_at: string;
}

export interface EpisodeDetail extends Episode {
  status_order: number;
  color_code: string;
  series_name: string | null;
  is_overdue: boolean;
  days_overdue: number | null;
}

export interface StatusHistory {
  id: number;
  episode_id: number;
  old_status: EpisodeStatus | null;
  new_status: EpisodeStatus;
  changed_by: string;
  change_reason: string | null;
  changed_at: string;
}

export type NewEpisode = Omit<Episode, 'id' | 'created_at' | 'updated_at'>;
export type UpdateEpisode = Partial<NewEpisode>;

// ステータスの順序定義
export const STATUS_ORDER: EpisodeStatus[] = [
  '台本作成中',
  '素材準備',
  '素材確定',
  '編集中',
  '試写1',
  '修正1',
  'MA中',
  '初稿完成',
  '修正中',
  '完パケ納品'
];

// ステータスの色定義
export const STATUS_COLORS: Record<EpisodeStatus, string> = {
  '台本作成中': '#6B7280',
  '素材準備': '#8B5CF6',
  '素材確定': '#6366F1',
  '編集中': '#3B82F6',
  '試写1': '#06B6D4',
  '修正1': '#10B981',
  'MA中': '#84CC16',
  '初稿完成': '#EAB308',
  '修正中': '#F59E0B',
  '完パケ納品': '#22C55E'
};

// 手戻り可能なステータスの定義
export const REVERTIBLE_STATUS: Record<EpisodeStatus, EpisodeStatus[]> = {
  '台本作成中': [],
  '素材準備': ['台本作成中'],
  '素材確定': ['素材準備'],
  '編集中': ['素材確定'],
  '試写1': ['編集中'],
  '修正1': ['編集中'],
  'MA中': ['修正1'],
  '初稿完成': ['修正1', 'MA中'],
  '修正中': ['編集中'],
  '完パケ納品': []
};