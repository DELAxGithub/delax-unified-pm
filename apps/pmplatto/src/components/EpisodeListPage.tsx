import React, { useState, useMemo } from 'react';
import { Plus, Filter, Calendar, User, ArrowUpDown } from 'lucide-react';
import { useEpisodes } from '../contexts/EpisodeContext';
import { StatusBadge } from './StatusBadge';
import { EpisodeModal } from './EpisodeModal';
import { Episode, EpisodeStatus, STATUS_ORDER } from '../types/episode';

type SortField = 'episode_id' | 'title' | 'due_date' | 'current_status' | 'director';
type SortOrder = 'asc' | 'desc';

export function EpisodeListPage() {
  const { episodes, loading, error, filters, setFilters, addEpisode, updateEpisode } = useEpisodes();
  const [showModal, setShowModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [sortField, setSortField] = useState<SortField>('episode_id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // ソート処理
  const sortedEpisodes = useMemo(() => {
    const sorted = [...episodes].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // ステータスの場合は順序で比較
      if (sortField === 'current_status') {
        aValue = STATUS_ORDER.indexOf(a.current_status);
        bValue = STATUS_ORDER.indexOf(b.current_status);
      }

      // null値の処理
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // 比較
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [episodes, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleEdit = (episode: Episode) => {
    setEditingEpisode(episode);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEpisode(null);
  };

  const handleSaveEpisode = async (episodeData: any) => {
    if (editingEpisode) {
      await updateEpisode(editingEpisode.id, episodeData);
    } else {
      await addEpisode(episodeData);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">エピソードを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        エラー: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">進捗すごろく</h1>
          <p className="text-text-secondary mt-1">PMPlatto番組の制作進捗を可視化</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            フィルター
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800"
          >
            <Plus className="w-4 h-4" />
            エピソード追加
          </button>
        </div>
      </div>

      {/* フィルター */}
      {showFilters && (
        <div className="bg-secondary/50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">シーズン</label>
              <select
                value={filters.season || ''}
                onChange={(e) => setFilters({ ...filters, season: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">すべて</option>
                <option value="1">シーズン1</option>
                <option value="2">シーズン2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">タイプ</label>
              <select
                value={filters.episode_type || ''}
                onChange={(e) => setFilters({ ...filters, episode_type: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">すべて</option>
                <option value="interview">インタビュー</option>
                <option value="vtr">VTR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">ステータス</label>
              <select
                value={filters.current_status || ''}
                onChange={(e) => setFilters({ ...filters, current_status: e.target.value as EpisodeStatus || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">すべて</option>
                {STATUS_ORDER.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">ディレクター</label>
              <input
                type="text"
                value={filters.director || ''}
                onChange={(e) => setFilters({ ...filters, director: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="ディレクター名"
              />
            </div>
          </div>
        </div>
      )}

      {/* 進捗すごろく（カード形式） */}
      <div className="space-y-6">
        {/* ステップ別カラム表示 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {STATUS_ORDER.map((status) => {
            const statusEpisodes = sortedEpisodes.filter(ep => ep.current_status === status);
            
            return (
              <div key={status} className="bg-white rounded-lg shadow-sm border">
                <div className="px-4 py-3 border-b bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-text-primary">{status}</h3>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {statusEpisodes.length}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 space-y-3 min-h-[200px]">
                  {statusEpisodes.map((episode) => {
                    const isOverdue = episode.due_date && 
                      new Date(episode.due_date) < new Date() && 
                      episode.current_status !== '完パケ納品';

                    return (
                      <div
                        key={episode.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleEdit(episode)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm text-text-primary line-clamp-2">
                                {episode.title || `エピソード ${episode.episode_id}`}
                              </div>
                              <div className="text-xs text-text-secondary mt-1">
                                ID: {episode.episode_id} | S{episode.season}E{episode.episode_number}
                              </div>
                            </div>
                          </div>
                          
                          {episode.guest_name && (
                            <div className="text-xs text-text-secondary">
                              <User className="w-3 h-3 inline mr-1" />
                              {episode.guest_name}
                            </div>
                          )}
                          
                          {episode.due_date && (
                            <div className={`flex items-center gap-1 text-xs ${
                              isOverdue ? 'text-red-600 font-medium' : 'text-text-secondary'
                            }`}>
                              <Calendar className="w-3 h-3" />
                              {new Date(episode.due_date).toLocaleDateString('ja-JP')}
                              {isOverdue && ' (遅延)'}
                            </div>
                          )}
                          
                          <div className="pt-2">
                            <StatusBadge status={episode.current_status} showProgress size="sm" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {statusEpisodes.length === 0 && (
                    <div className="text-center py-8 text-text-secondary text-sm">
                      このステップにはエピソードがありません
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {sortedEpisodes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div className="text-text-secondary mb-4">制作中のエピソードがありません</div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800"
            >
              <Plus className="w-4 h-4" />
              最初のエピソードを追加
            </button>
          </div>
        )}
      </div>

      {/* エピソード追加・編集モーダル */}
      {showModal && (
        <EpisodeModal
          episode={editingEpisode}
          onClose={handleCloseModal}
          onSave={handleSaveEpisode}
        />
      )}
    </div>
  );
}