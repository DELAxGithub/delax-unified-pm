import { supabase } from './supabase';
import type { Program, NewProgram, UpdateProgram } from '../types/program';
import type { CalendarTask, NewCalendarTask, UpdateCalendarTask } from '../types/calendar-task';
import type { Episode, StatusHistory, NewEpisode, UpdateEpisode, EpisodeStatus } from '../types/episode';

// エピソード関連の関数
export async function getEpisodes(filters?: {
  season?: number;
  episode_type?: string;
  current_status?: EpisodeStatus;
  director?: string;
}) {
  let query = supabase
    .from('liberary_episode')
    .select('*')
    .order('episode_id', { ascending: true });

  if (filters) {
    if (filters.season) query = query.eq('season', filters.season);
    if (filters.episode_type) query = query.eq('episode_type', filters.episode_type);
    if (filters.current_status) query = query.eq('current_status', filters.current_status);
    if (filters.director) query = query.eq('director', filters.director);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Episode[];
}

export async function getEpisodeById(id: number) {
  const { data, error } = await supabase
    .from('liberary_episode')
    .select('*')
    .eq('episode_id', id)
    .single();

  if (error) throw error;
  return data as Episode;
}

export async function createEpisode(episode: NewEpisode) {
  const { data, error } = await supabase
    .from('liberary_episode')
    .insert([episode])
    .select()
    .single();

  if (error) throw error;
  return data as Episode;
}

export async function updateEpisode(id: number, updates: UpdateEpisode) {
  const { data, error } = await supabase
    .from('liberary_episode')
    .update(updates)
    .eq('episode_id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Episode;
}

export async function updateEpisodeStatus(id: number, newStatus: EpisodeStatus, reason?: string) {
  // 現在のエピソード情報を取得
  const { data: episode, error: fetchError } = await supabase
    .from('liberary_episode')
    .select('current_status')
    .eq('episode_id', id)
    .single();

  if (fetchError) throw fetchError;

  // ステータスを更新
  const { data, error } = await supabase
    .from('liberary_episode')
    .update({ current_status: newStatus })
    .eq('episode_id', id)
    .select()
    .single();

  if (error) throw error;

  // 履歴を記録
  const { error: historyError } = await supabase
    .from('status_history')
    .insert([{
      episode_id: id,
      old_status: episode.current_status,
      new_status: newStatus,
      change_reason: reason
    }]);

  if (historyError) throw historyError;
  
  return data as Episode;
}

export async function deleteEpisode(id: number) {
  const { error } = await supabase
    .from('liberary_episode')
    .delete()
    .eq('episode_id', id);

  if (error) throw error;
}

export async function getEpisodeHistory(episodeId: number) {
  const { data, error } = await supabase
    .from('status_history')
    .select('*')
    .eq('episode_id', episodeId)
    .order('changed_at', { ascending: false });

  if (error) throw error;
  return data as StatusHistory[];
}

// 既存のプログラム関連の関数
export async function getPrograms() {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Program[];
}

export async function createProgram(program: NewProgram) {
  const { data, error } = await supabase
    .from('programs')
    .insert([program])
    .select()
    .single();

  if (error) throw error;
  return data as Program;
}

export async function updateProgram(id: number, updates: UpdateProgram) {
  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Program;
}

export async function deleteProgram(id: number) {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// カレンダータスク関連の関数
export async function getCalendarTasks() {
  const { data, error } = await supabase
    .from('calendar_tasks')
    .select(`
      *,
      program:programs (
        id,
        title
      )
    `)
    .order('is_team_event', { ascending: false })
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data as (CalendarTask & { program: Program | null })[];
}

export async function createCalendarTask(task: NewCalendarTask) {
  const { data, error } = await supabase
    .from('calendar_tasks')
    .insert([task])
    .select(`
      *,
      program:programs (
        id,
        title
      )
    `)
    .single();

  if (error) throw error;
  return data as CalendarTask & { program: Program | null };
}

export async function updateCalendarTask(id: string, updates: UpdateCalendarTask) {
  const { data, error } = await supabase
    .from('calendar_tasks')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      program:programs (
        id,
        title
      )
    `)
    .single();

  if (error) throw error;
  return data as CalendarTask & { program: Program | null };
}

export async function deleteCalendarTask(id: string) {
  const { error } = await supabase
    .from('calendar_tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 日付に近い番組を取得する関数を改善
export async function getNearbyPrograms(date: string) {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('first_air_date', { ascending: true });

  if (error) throw error;

  const programs = data as Program[];
  const targetDate = new Date(date);

  // 日付との差分を計算し、放送日の近さでソート
  const sortedPrograms = programs.sort((a, b) => {
    const dateA = a.first_air_date ? new Date(a.first_air_date) : new Date('9999-12-31');
    const dateB = b.first_air_date ? new Date(b.first_air_date) : new Date('9999-12-31');
    
    const diffA = Math.abs(dateA.getTime() - targetDate.getTime());
    const diffB = Math.abs(dateB.getTime() - targetDate.getTime());
    
    if (diffA === diffB) {
      // 日付の差が同じ場合は、番組IDの降順（新しい順）でソート
      const idA = parseInt(a.program_id || '0', 10);
      const idB = parseInt(b.program_id || '0', 10);
      return idB - idA;
    }
    
    return diffA - diffB;
  });

  return sortedPrograms;
}