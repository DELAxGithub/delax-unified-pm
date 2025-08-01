// Client exports
export * from './client';

// Re-export Supabase types that might be useful
export type {
  AuthError,
  AuthSession,
  User,
  PostgrestError,
  RealtimeChannel,
} from '@supabase/supabase-js';