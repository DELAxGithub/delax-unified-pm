import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  getEpisodes, 
  createEpisode, 
  updateEpisode, 
  updateEpisodeStatus,
  deleteEpisode,
  getEpisodeHistory 
} from '../lib/api';
import type { Episode, NewEpisode, UpdateEpisode, StatusHistory, EpisodeStatus } from '../types/episode';
import { useAuth } from './AuthContext';

interface EpisodeFilters {
  season?: number;
  episode_type?: string;
  current_status?: EpisodeStatus;
  director?: string;
}

interface EpisodeContextType {
  episodes: Episode[];
  loading: boolean;
  error: string | null;
  filters: EpisodeFilters;
  setFilters: (filters: EpisodeFilters) => void;
  refreshEpisodes: () => Promise<void>;
  addEpisode: (episode: NewEpisode) => Promise<Episode>;
  updateEpisode: (id: number, updates: UpdateEpisode) => Promise<Episode>;
  updateEpisodeStatus: (id: number, newStatus: EpisodeStatus, reason?: string) => Promise<Episode>;
  deleteEpisode: (id: number) => Promise<void>;
  getEpisodeHistory: (episodeId: number) => Promise<StatusHistory[]>;
}

const EpisodeContext = createContext<EpisodeContextType | undefined>(undefined);

export function EpisodeProvider({ children }: { children: React.ReactNode }) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EpisodeFilters>({});
  const { user } = useAuth();

  const refreshEpisodes = async () => {
    try {
      setError(null);
      const data = await getEpisodes(filters);
      setEpisodes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エピソードデータの取得に失敗しました');
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      refreshEpisodes().finally(() => setLoading(false));

      // リアルタイム更新のサブスクリプション設定
      const channel = supabase
        .channel('episodes_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'liberary_episode'
          },
          async (payload) => {
            console.log('Episode change detected:', payload);
            switch (payload.eventType) {
              case 'INSERT':
                setEpisodes(prev => [payload.new as Episode, ...prev]);
                break;
              case 'UPDATE':
                setEpisodes(prev =>
                  prev.map(e => (e.id === payload.new.id ? payload.new as Episode : e))
                );
                break;
              case 'DELETE':
                setEpisodes(prev =>
                  prev.filter(e => e.id !== payload.old.id)
                );
                break;
              default:
                await refreshEpisodes();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setEpisodes([]);
      setLoading(false);
    }
  }, [user, filters]);

  const handleAddEpisode = async (episode: NewEpisode) => {
    const newEpisode = await createEpisode(episode);
    // リアルタイム更新が自動的に行われるため、refreshEpisodesは不要
    return newEpisode;
  };

  const handleUpdateEpisode = async (id: number, updates: UpdateEpisode) => {
    const updatedEpisode = await updateEpisode(id, updates);
    // リアルタイム更新が自動的に行われるため、refreshEpisodesは不要
    return updatedEpisode;
  };

  const handleUpdateEpisodeStatus = async (id: number, newStatus: EpisodeStatus, reason?: string) => {
    const updatedEpisode = await updateEpisodeStatus(id, newStatus, reason);
    // リアルタイム更新が自動的に行われるため、refreshEpisodesは不要
    return updatedEpisode;
  };

  const handleDeleteEpisode = async (id: number) => {
    await deleteEpisode(id);
    // リアルタイム更新が自動的に行われるため、refreshEpisodesは不要
  };

  const value = {
    episodes,
    loading,
    error,
    filters,
    setFilters,
    refreshEpisodes,
    addEpisode: handleAddEpisode,
    updateEpisode: handleUpdateEpisode,
    updateEpisodeStatus: handleUpdateEpisodeStatus,
    deleteEpisode: handleDeleteEpisode,
    getEpisodeHistory
  };

  return (
    <EpisodeContext.Provider value={value}>
      {children}
    </EpisodeContext.Provider>
  );
}

export function useEpisodes() {
  const context = useContext(EpisodeContext);
  if (context === undefined) {
    throw new Error('useEpisodes must be used within an EpisodeProvider');
  }
  return context;
}