import { supabase } from './supabase';
import type { Program, NewProgram, UpdateProgram } from '../types/program';
import type { CalendarTask, NewCalendarTask, UpdateCalendarTask } from '../types/calendar-task';
import type { Episode } from '../types/episode';
import { programToEpisode, episodeToProgram, type Program as AdapterProgram } from './dataAdapters';

// 既存のプログラム関連の関数
export async function getPrograms() {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Program[];
}

// エピソード用API関数（programsテーブルを翻訳してepisodes形式で提供）
export async function getEpisodes(): Promise<Episode[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('program_id', { ascending: true });

  if (error) throw error;
  
  // programsデータをepisodes形式に変換
  return (data as AdapterProgram[]).map(programToEpisode);
}

export async function createEpisode(episodeData: Omit<Episode, 'id' | 'created_at' | 'updated_at'>): Promise<Episode> {
  // episodeデータをprogram形式に変換
  const programData = episodeToProgram({
    ...episodeData,
    id: '', // 仮のID、DBで自動生成される
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const { data, error } = await supabase
    .from('programs')
    .insert([{
      program_id: programData.program_id,
      title: programData.title,
      subtitle: programData.subtitle,
      status: programData.status,
      cast1: programData.cast1,
      cast2: programData.cast2,
      notes: programData.notes,
      first_air_date: programData.first_air_date,
      pr_due_date: programData.pr_due_date,
    }])
    .select()
    .single();

  if (error) throw error;
  
  // 作成されたprogramをepisode形式に変換して返す
  return programToEpisode(data as AdapterProgram);
}

export async function updateEpisode(id: string, episodeData: Partial<Episode>): Promise<Episode> {
  // 既存のprogramデータを取得
  const { data: existingData, error: fetchError } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;
  
  // episodeの更新データをprogram形式に変換
  const programUpdates = episodeToProgram({
    id,
    created_at: existingData.created_at,
    updated_at: new Date().toISOString(),
    ...episodeData,
  } as Episode, existingData as AdapterProgram);

  const { data, error } = await supabase
    .from('programs')
    .update({
      program_id: programUpdates.program_id,
      title: programUpdates.title,
      subtitle: programUpdates.subtitle,
      status: programUpdates.status,
      cast1: programUpdates.cast1,
      cast2: programUpdates.cast2,
      notes: programUpdates.notes,
      first_air_date: programUpdates.first_air_date,
      pr_due_date: programUpdates.pr_due_date,
      updated_at: programUpdates.updated_at,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  // 更新されたprogramをepisode形式に変換して返す
  return programToEpisode(data as AdapterProgram);
}

export async function deleteEpisode(id: string): Promise<void> {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id);

  if (error) throw error;
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
        program_id,
        title
      )
    `)
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
        program_id,
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
        program_id,
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