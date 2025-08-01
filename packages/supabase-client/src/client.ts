import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database type definitions
export interface Database {
  public: {
    Tables: {
      programs: {
        Row: {
          id: number;
          program_id: string;
          title: string;
          subtitle: string | null;
          status: string;
          first_air_date: string | null;
          re_air_date: string | null;
          filming_date: string | null;
          complete_date: string | null;
          cast1: string | null;
          cast2: string | null;
          script_url: string | null;
          pr_80text: string | null;
          pr_200text: string | null;
          notes: string | null;
          pr_completed: boolean;
          pr_due_date: string | null;
          created_at: string;
          updated_at: string;
          series_name: string | null;
          series_type: string | null;
          season: number | null;
          total_episodes: number | null;
        };
        Insert: Omit<Database['public']['Tables']['programs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['programs']['Insert']>;
      };
      episodes: {
        Row: {
          id: number;
          episode_id: string;
          title: string;
          episode_type: string;
          season: number;
          episode_number: number;
          script_url: string | null;
          current_status: string;
          director: string | null;
          due_date: string | null;
          guest_name: string | null;
          recording_date: string | null;
          recording_location: string | null;
          material_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['episodes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['episodes']['Insert']>;
      };
      calendar_tasks: {
        Row: {
          id: string;
          program_id: number | null;
          task_type: string;
          start_date: string;
          end_date: string;
          meeting_url: string | null;
          description: string | null;
          is_team_event: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['calendar_tasks']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['calendar_tasks']['Insert']>;
      };
    };
  };
}

export type SupabaseClientType = SupabaseClient<Database>;

// Client creation function
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string
): SupabaseClientType {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Environment-specific client creation
export function createClientFromEnv(): SupabaseClientType {
  // Use process.env for Node.js compatibility in packages
  const supabaseUrl = (typeof window !== 'undefined' 
    ? (window as any).import?.meta?.env?.VITE_SUPABASE_URL 
    : process.env.VITE_SUPABASE_URL) || '';
  const supabaseAnonKey = (typeof window !== 'undefined' 
    ? (window as any).import?.meta?.env?.VITE_SUPABASE_ANON_KEY 
    : process.env.VITE_SUPABASE_ANON_KEY) || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}