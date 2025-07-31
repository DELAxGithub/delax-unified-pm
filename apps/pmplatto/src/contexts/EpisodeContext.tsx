import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getEpisodes, createEpisode, updateEpisode as updateEpisodeAPI, deleteEpisode as deleteEpisodeAPI } from '../lib/api';
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
  updateEpisode: (id: string, updates: UpdateEpisode) => Promise<Episode>;
  updateEpisodeStatus: (id: string, newStatus: EpisodeStatus, reason?: string) => Promise<Episode>;
  deleteEpisode: (id: string) => Promise<void>;
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
      // 新しいAPI関数を使用してプログラムデータをエピソード形式で取得
      const data = await getEpisodes();
      
      // フィルタリング処理（クライアントサイド）
      let filteredData = data;
      
      if (filters.season) {
        filteredData = filteredData.filter(ep => ep.season === filters.season);
      }
      if (filters.episode_type) {
        filteredData = filteredData.filter(ep => ep.episode_type === filters.episode_type);
      }
      if (filters.current_status) {
        filteredData = filteredData.filter(ep => ep.current_status === filters.current_status);
      }
      if (filters.director) {
        filteredData = filteredData.filter(ep => 
          ep.director?.toLowerCase().includes(filters.director!.toLowerCase())
        );
      }
      
      setEpisodes(filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エピソードデータの取得に失敗しました');
      throw err;
    }
  };

  const addEpisode = async (episode: NewEpisode): Promise<Episode> => {
    try {
      // 新しいAPI関数を使用（内部でprogramsテーブルに保存）
      const data = await createEpisode(episode);
      setEpisodes(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エピソードの作成に失敗しました';
      setError(message);
      throw err;
    }
  };

  const updateEpisode = async (id: string, updates: UpdateEpisode): Promise<Episode> => {
    try {
      // 新しいAPI関数を使用（内部でprogramsテーブルを更新）
      const data = await updateEpisodeAPI(id, updates);
      setEpisodes(prev => prev.map(e => e.id === id ? data : e));
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エピソードの更新に失敗しました';
      setError(message);
      throw err;
    }
  };

  const updateEpisodeStatus = async (id: string, newStatus: EpisodeStatus, reason?: string): Promise<Episode> => {
    try {
      // 新しいAPI関数を使用してステータスを更新
      const data = await updateEpisodeAPI(id, { current_status: newStatus });
      setEpisodes(prev => prev.map(e => e.id === id ? data : e));
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ステータスの更新に失敗しました';
      setError(message);
      throw err;
    }
  };

  const deleteEpisode = async (id: string): Promise<void> => {
    try {
      // 新しいAPI関数を使用（内部でprogramsテーブルから削除）
      await deleteEpisodeAPI(id);
      setEpisodes(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エピソードの削除に失敗しました';
      setError(message);
      throw err;
    }
  };

  const getEpisodeHistory = async (episodeId: number): Promise<StatusHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('status_history')
        .select('*')
        .eq('episode_id', episodeId)
        .order('changed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : '履歴の取得に失敗しました';
      setError(message);
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
            table: 'episodes'
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

  return (
    <EpisodeContext.Provider
      value={{
        episodes,
        loading,
        error,
        filters,
        setFilters,
        refreshEpisodes,
        addEpisode,
        updateEpisode,
        updateEpisodeStatus,
        deleteEpisode,
        getEpisodeHistory
      }}
    >
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