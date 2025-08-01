import React, { useState, useMemo } from 'react';
import { Plus, Filter, Calendar, User, ArrowUpDown } from 'lucide-react';
import { useEpisodes } from '../contexts/EpisodeContext';
import { StatusBadge } from './StatusBadge';
import { EpisodeModal } from './EpisodeModal';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Episode, EpisodeStatus, STATUS_ORDER } from '../types/episode';

type SortField = 'episode_id' | 'title' | 'due_date' | 'current_status' | 'director';
type SortOrder = 'asc' | 'desc';

export function EpisodeListPage() {
  const { episodes, loading, error, filters, setFilters } = useEpisodes();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">エピソードを読み込み中...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">エピソード管理</h1>
          <p className="text-gray-600 mt-1">LIBRARY番組のエピソード制作進捗</p>
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            新規エピソード
          </button>
        </div>
      </div>

      {/* フィルター */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={filters.season || ''}
              onChange={(e) => setFilters({ ...filters, season: e.target.value ? Number(e.target.value) : undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全シーズン</option>
              <option value="1">シーズン1</option>
              <option value="2">シーズン2</option>
            </select>
            <select
              value={filters.episode_type || ''}
              onChange={(e) => setFilters({ ...filters, episode_type: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全タイプ</option>
              <option value="interview">インタビュー</option>
              <option value="vtr">VTR</option>
            </select>
            <select
              value={filters.current_status || ''}
              onChange={(e) => setFilters({ ...filters, current_status: (e.target.value as EpisodeStatus) || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全ステータス</option>
              {STATUS_ORDER.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="担当者で検索"
              value={filters.director || ''}
              onChange={(e) => setFilters({ ...filters, director: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* エピソード一覧テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('episode_id')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    エピソードID
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('title')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    タイトル
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タイプ
                </th>
                <th 
                  onClick={() => handleSort('current_status')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    ステータス
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('due_date')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    納期
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('director')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    担当者
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedEpisodes.map((episode) => (
                <tr key={episode.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {episode.episode_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {episode.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {episode.episode_type === 'interview' ? 'インタビュー' : 'VTR'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={episode.current_status} showProgress size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {episode.due_date ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(episode.due_date), 'yyyy/MM/dd', { locale: ja })}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {episode.director ? (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {episode.director}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(episode)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      編集
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* モーダル */}
      {showModal && (
        <EpisodeModal
          episode={editingEpisode}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}