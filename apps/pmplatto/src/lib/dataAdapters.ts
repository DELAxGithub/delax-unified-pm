/**
 * データアダプター層
 * PMPlattoの programs データを PMLibrary UI想定の episodes 形式に翻訳
 */

import { Episode, EpisodeStatus } from '../types/episode';

// PMPlattoの実際のProgram型（現在のDBスキーマ）
export interface Program {
  id: string;
  program_id: string;
  first_air_date: string | null;
  filming_date: string | null;
  complete_date: string | null;
  title: string | null;
  subtitle: string | null;
  status: string | null;
  cast1: string | null;
  cast2: string | null;
  notes: string | null;
  script_url: string | null;
  pr_80text: string | null;
  pr_200text: string | null;
  re_air_date: string | null;
  created_at: string;
  updated_at: string | null;
  pr_completed: boolean | null;
  pr_due_date: string | null;
}

// ステータスマッピング：PMPlatto → PMLibrary UI
const STATUS_MAPPING: Record<string, EpisodeStatus> = {
  'キャスティング中': '台本作成中',
  'ロケハン前': '素材準備',
  '収録準備中': '収録',
  '編集中': '編集',
  'MA中': 'MA',
  '完パケ納品': '完パケ納品',
  '放送済み': 'OA済み',
  // 追加のステータスがあれば適宜マッピング
};

// 逆マッピング：UI → PMPlatto DB
const REVERSE_STATUS_MAPPING: Record<EpisodeStatus, string> = Object.fromEntries(
  Object.entries(STATUS_MAPPING).map(([key, value]) => [value, key])
) as Record<EpisodeStatus, string>;

/**
 * PMPlattoのProgramデータをPMLibrary UI想定のEpisodeに変換
 */
export function programToEpisode(program: Program): Episode {
  // program_idから season と episode_number を推定
  const episodeNumber = parseInt(program.program_id) || 1;
  const season = Math.ceil(episodeNumber / 13); // 13話ごとにシーズン分け（調整可能）

  // ステータス変換
  const currentStatus = program.status ? 
    (STATUS_MAPPING[program.status] || '台本作成中') : '台本作成中';

  // 出演者情報の統合
  const guestName = [program.cast1, program.cast2].filter(Boolean).join(' × ');

  return {
    id: program.id,
    episode_id: program.program_id,
    title: program.title || '',
    season,
    episode_number: episodeNumber,
    episode_type: 'interview', // PMPlattoは主にインタビュー形式と仮定
    current_status: currentStatus,
    due_date: program.first_air_date || program.pr_due_date || null,
    director: null, // PMPlattoにはディレクター情報がないのでnull
    guest_name: guestName || null,
    material_status: null, // PMPlattoにはない情報
    notes: program.notes || null,
    created_at: program.created_at,
    updated_at: program.updated_at,
  };
}

/**
 * PMLibrary UI想定のEpisodeをPMPlattoのProgram形式に逆変換
 */
export function episodeToProgram(episode: Episode, originalProgram?: Program): Partial<Program> {
  // 出演者情報の分割
  const guests = episode.guest_name ? episode.guest_name.split(' × ') : [];
  
  return {
    id: episode.id,
    program_id: episode.episode_id,
    title: episode.title,
    subtitle: originalProgram?.subtitle || null,
    status: REVERSE_STATUS_MAPPING[episode.current_status] || 'キャスティング中',
    cast1: guests[0] || null,
    cast2: guests[1] || null,
    notes: episode.notes,
    first_air_date: episode.due_date,
    pr_due_date: episode.due_date,
    updated_at: new Date().toISOString(),
    // 他のフィールドは既存値を保持
    filming_date: originalProgram?.filming_date || null,
    complete_date: originalProgram?.complete_date || null,
    script_url: originalProgram?.script_url || null,
    pr_80text: originalProgram?.pr_80text || null,
    pr_200text: originalProgram?.pr_200text || null,
    re_air_date: originalProgram?.re_air_date || null,
    pr_completed: originalProgram?.pr_completed || null,
  };
}

/**
 * 進捗率計算（PMPlatto番組用）
 */
export function calculateProgress(status: string | null): number {
  const progressMap: Record<string, number> = {
    'キャスティング中': 10,
    'ロケハン前': 20,
    '収録準備中': 30,
    '編集中': 50,
    'MA中': 70,
    '完パケ納品': 90,
    '放送済み': 100,
  };
  
  return progressMap[status || ''] || 0;
}

/**
 * ステータス順序定義（PMPlatto版）
 */
export const PMPLATTO_STATUS_ORDER = [
  'キャスティング中',
  'ロケハン前', 
  '収録準備中',
  '編集中',
  'MA中',
  '完パケ納品',
  '放送済み'
];

/**
 * 利用可能な全ステータス（UI表示用）
 */
export function getAvailableStatuses(): EpisodeStatus[] {
  return Object.values(STATUS_MAPPING);
}

/**
 * ステータス変換ユーティリティ
 */
export const StatusAdapter = {
  toEpisode: (programStatus: string): EpisodeStatus => {
    return STATUS_MAPPING[programStatus] || '台本作成中';
  },
  
  toProgram: (episodeStatus: EpisodeStatus): string => {
    return REVERSE_STATUS_MAPPING[episodeStatus] || 'キャスティング中';
  },
  
  getProgress: calculateProgress,
  
  getStatusOrder: () => PMPLATTO_STATUS_ORDER,
};