// program.tsを拡張したLIBRARY用の型定義
import { Program as BaseProgram } from './program';

export interface ProgramExtended extends BaseProgram {
  // LIBRARY用の追加フィールド
  series_name?: string | null;
  series_type?: 'interview' | 'vtr' | null;
  season?: number | null;
  total_episodes?: number | null;
}

export type NewProgramExtended = Omit<ProgramExtended, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProgramExtended = Partial<NewProgramExtended>;