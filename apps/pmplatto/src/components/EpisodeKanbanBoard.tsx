import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MoreVertical, AlertTriangle, Calendar, User, ChevronDown, Filter, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { getJSTToday, isJSTBefore } from '../lib/timezone';
import type { Episode, EpisodeStatus } from '../types/episode';
import { STATUS_ORDER, STATUS_COLORS, REVERTIBLE_STATUS } from '../types/episode';
import { useEpisodes } from '../contexts/EpisodeContext';
import { EpisodeModal } from './EpisodeModal';

interface EpisodeCardProps {
  episode: Episode;
  index: number;
  onClick: () => void;
}

function EpisodeCard({ episode, index, onClick }: EpisodeCardProps) {
  const today = getJSTToday();
  const isOverdue = episode.due_date && isJSTBefore(episode.due_date, today) && episode.current_status !== '完パケ納品';
  
  return (
    <Draggable draggableId={episode.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2 ${
            snapshot.isDragging ? 'shadow-lg opacity-60 rotate-3 scale-105' : 'hover:shadow-md'
          } ${isOverdue ? 'ring-2 ring-red-200 border-red-300' : ''} transition-all duration-200 cursor-pointer`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="text-xs text-text-secondary font-medium truncate">
                  {episode.episode_id}
                </div>
                {isOverdue && (
                  <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />
                )}
              </div>
              <h3 className="text-sm font-medium text-text-primary truncate mt-0.5">
                {episode.title}
              </h3>
              
              {/* エピソード固有の情報 */}
              <div className="flex flex-col gap-1 mt-2 text-xs text-text-secondary">
                {episode.guest_name && (
                  <div className="flex items-center gap-1">
                    <User size={10} />
                    <span className="truncate">{episode.guest_name}</span>
                  </div>
                )}
                {episode.director && (
                  <div className="flex items-center gap-1">
                    <span>🎬</span>
                    <span className="truncate">{episode.director}</span>
                  </div>
                )}
                {episode.due_date && (
                  <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                    <Calendar size={10} />
                    <span>
                      {format(parseISO(episode.due_date), 'M/d', { locale: ja })}
                      {isOverdue && ' (期限切れ)'}
                    </span>
                  </div>
                )}
                {episode.material_status && (
                  <div className="flex items-center gap-1">
                    <span>📁</span>
                    <span>素材: {episode.material_status}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                className="text-text-secondary hover:text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <MoreVertical size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}


interface RollbackReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  fromStatus: EpisodeStatus;
  toStatus: EpisodeStatus;
}

function RollbackReasonModal({ isOpen, onClose, onConfirm, fromStatus, toStatus }: RollbackReasonModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
      setReason('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          手戻り理由を入力
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          「{fromStatus}」から「{toStatus}」への変更理由を記録してください。
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="手戻りの理由を入力してください..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            rows={4}
            required
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              確定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EpisodeKanbanBoard() {
  const { episodes, loading, error, updateEpisode, filters, setFilters } = useEpisodes();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    episodeId: number;
    fromStatus: EpisodeStatus;
    toStatus: EpisodeStatus;
  } | null>(null);

  const filteredEpisodes = episodes.filter(episode => {
    // 検索クエリフィルター
    const query = searchQuery.toLowerCase();
    if (query && !(
      (episode.title || '').toLowerCase().includes(query) ||
      (episode.episode_id || '').toLowerCase().includes(query) ||
      (episode.guest_name || '').toLowerCase().includes(query) ||
      (episode.director || '').toLowerCase().includes(query)
    )) {
      return false;
    }

    // ContextのfiltersはAPI側で適用されているため、ここでは検索のみ
    return true;
  });

  const handleDragEnd = async (result: { destination?: { droppableId: string; index: number } | null; source: { droppableId: string; index: number }; draggableId: string }) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const episodeId = parseInt(draggableId, 10);
    const episode = episodes.find(e => e.id === episodeId);
    if (!episode) return;

    const fromStatus = episode.current_status;
    const toStatus = destination.droppableId as EpisodeStatus;

    // 全フェーズ間でのドラッグ&ドロップを許可

    // 手戻りチェック
    const fromIndex = STATUS_ORDER.indexOf(fromStatus);
    const toIndex = STATUS_ORDER.indexOf(toStatus);
    const isRollback = toIndex < fromIndex;

    if (isRollback) {
      // 手戻り可能かチェック
      const allowedRollbacks = REVERTIBLE_STATUS[fromStatus] || [];
      if (!allowedRollbacks.includes(toStatus)) {
        alert(`「${fromStatus}」から「${toStatus}」への手戻りは許可されていません。`);
        return;
      }

      // 手戻り理由の入力を求める
      setPendingStatusChange({ episodeId, fromStatus, toStatus });
      setShowRollbackModal(true);
      return;
    }

    // 通常の進行
    await executeStatusChange(episodeId, toStatus);
  };

  const executeStatusChange = async (episodeId: number, newStatus: EpisodeStatus, reason?: string) => {
    try {
      await updateEpisode(episodeId, {
        current_status: newStatus
      });
      // TODO: ステータス履歴に理由を記録する場合はここで実装
      if (reason) {
        // 理由が必要な場合の処理（将来的に実装）
        console.log('Status change reason:', reason);
      }
    } catch (error) {
      console.error('Failed to update episode status:', error);
    }
  };

  const handleRollbackConfirm = async (reason: string) => {
    if (pendingStatusChange) {
      await executeStatusChange(pendingStatusChange.episodeId, pendingStatusChange.toStatus, reason);
      setPendingStatusChange(null);
    }
    setShowRollbackModal(false);
  };

  const handleCardClick = (episode: Episode) => {
    setSelectedEpisode(episode);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7rem)]">
        <div className="text-text-primary">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-7rem)]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-text-primary">
            エピソード進捗すごろく
          </h2>
          <div className="text-sm text-text-secondary">
            全 {episodes.length} エピソード
          </div>
          {/* フィルター適用中バッジ */}
          {(filters.season || filters.episode_type || filters.current_status || filters.director) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              フィルター適用中
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* フィルターボタン */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                (filters.season || filters.episode_type || filters.current_status || filters.director) 
                  ? 'border-primary text-primary' 
                  : 'border-gray-200 text-text-primary'
              } hover:bg-gray-50 transition-colors`}
            >
              <Filter className="w-4 h-4" />
              フィルター
            </button>
            
            {/* フィルターパネル */}
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-text-primary">フィルター</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* シーズン */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        シーズン
                      </label>
                      <select
                        value={filters.season || ''}
                        onChange={(e) => setFilters({ ...filters, season: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
                      >
                        <option value="">全シーズン</option>
                        <option value="1">シーズン1</option>
                        <option value="2">シーズン2</option>
                      </select>
                    </div>

                    {/* エピソードタイプ */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        タイプ
                      </label>
                      <select
                        value={filters.episode_type || ''}
                        onChange={(e) => setFilters({ ...filters, episode_type: e.target.value || undefined })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
                      >
                        <option value="">全タイプ</option>
                        <option value="interview">インタビュー</option>
                        <option value="vtr">VTR</option>
                      </select>
                    </div>

                    {/* ステータス */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        ステータス
                      </label>
                      <select
                        value={filters.current_status || ''}
                        onChange={(e) => setFilters({ ...filters, current_status: (e.target.value as EpisodeStatus) || undefined })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
                      >
                        <option value="">全ステータス</option>
                        {STATUS_ORDER.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    {/* 担当者 */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        担当者
                      </label>
                      <input
                        type="text"
                        placeholder="担当者で検索"
                        value={filters.director || ''}
                        onChange={(e) => setFilters({ ...filters, director: e.target.value || undefined })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* フィルターリセット */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setFilters({});
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-text-primary hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      フィルターをリセット
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 検索ボックス */}
          <input
            type="search"
            placeholder="エピソードを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>
      
      {/* 縦型カンバンボード */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-4 md:space-y-6">
          {STATUS_ORDER.map((status, statusIndex) => {
            const statusEpisodes = filteredEpisodes.filter(e => e.current_status === status);
            const isLastPhase = statusIndex === STATUS_ORDER.length - 1;
            
            return (
              <div key={status} className="relative">
                {/* フェーズヘッダー */}
                <div 
                  className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 p-3 md:p-4 rounded-lg border"
                  style={{
                    background: `linear-gradient(135deg, ${STATUS_COLORS[status]}15, ${STATUS_COLORS[status]}05)`,
                    borderColor: `${STATUS_COLORS[status]}30`
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: STATUS_COLORS[status] }}
                  />
                  <h3 className="text-lg md:text-xl font-semibold text-text-primary">
                    {status}
                  </h3>
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium text-white shadow-sm"
                    style={{ backgroundColor: STATUS_COLORS[status] }}
                  >
                    {statusEpisodes.length}件
                  </span>
                </div>

                {/* カード表示エリア */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 min-h-[120px] p-3 md:p-4 rounded-lg border-2 border-dashed transition-all duration-300 ${
                        snapshot.isDraggingOver 
                          ? 'border-primary bg-blue-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {statusEpisodes.map((episode, index) => (
                        <EpisodeCard
                          key={episode.id}
                          episode={episode}
                          index={index}
                          onClick={() => handleCardClick(episode)}
                        />
                      ))}
                      {provided.placeholder}
                      
                      {/* 空の状態 */}
                      {statusEpisodes.length === 0 && (
                        <div className="col-span-full flex items-center justify-center py-8 text-text-secondary">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📋</div>
                            <div className="text-sm">ここにカードをドラッグ</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>

                {/* 進捗矢印（最後のフェーズ以外） */}
                {!isLastPhase && (
                  <div className="flex justify-center my-4">
                    <div className="flex flex-col items-center text-text-secondary">
                      <ChevronDown size={24} className="animate-bounce" />
                      <div className="text-xs font-medium mt-1">進捗</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {showModal && selectedEpisode && (
        <EpisodeModal
          episode={selectedEpisode}
          onClose={() => {
            setShowModal(false);
            setSelectedEpisode(null);
          }}
        />
      )}

      {showRollbackModal && pendingStatusChange && (
        <RollbackReasonModal
          isOpen={showRollbackModal}
          onClose={() => {
            setShowRollbackModal(false);
            setPendingStatusChange(null);
          }}
          onConfirm={handleRollbackConfirm}
          fromStatus={pendingStatusChange.fromStatus}
          toStatus={pendingStatusChange.toStatus}
        />
      )}
    </div>
  );
}