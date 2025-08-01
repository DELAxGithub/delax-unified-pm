import React from 'react';
import { X, ExternalLink, Trash2, Calendar, Clock, Link2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CalendarTask, TEAM_EVENT_COLORS, type TeamEventType } from '../types/calendar-task';

interface TeamEventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarTask;
  onDelete: () => void;
}

export function TeamEventDetailModal({ 
  isOpen, 
  onClose, 
  event, 
  onDelete 
}: TeamEventDetailModalProps) {
  if (!isOpen) return null;

  const eventColor = TEAM_EVENT_COLORS[event.task_type as TeamEventType];
  const startDate = parseISO(event.start_date);
  const endDate = parseISO(event.end_date);
  const isSameDay = event.start_date === event.end_date;

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case '🌐 全体会議': return '🌐';
      case '💼 制作会議': return '💼';
      case '🎬 スタジオ収録': return '🎬';
      case '⚠️ 重要': return '⚠️';
      default: return '📅';
    }
  };

  const handleUrlClick = () => {
    if (event.meeting_url) {
      window.open(event.meeting_url, '_blank');
    }
  };

  const handleDelete = () => {
    if (confirm('このイベントを削除しますか？')) {
      onDelete();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* ヘッダー */}
        <div 
          className="p-6 border-b border-gray-200 rounded-t-lg"
          style={{
            background: eventColor?.gradient || eventColor?.bg,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getEventIcon(event.task_type)}</span>
              <div>
                <h2 className={`text-xl font-semibold ${eventColor?.text || 'text-white'}`}>
                  {event.task_type}
                </h2>
                <p className={`text-sm opacity-90 ${eventColor?.text || 'text-white'}`}>
                  チームイベント
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`${eventColor?.text || 'text-white'} hover:opacity-75 transition-opacity`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 詳細情報 */}
        <div className="p-6 space-y-4">
          {/* 日程 */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-text-primary mb-1">開催日程</div>
              <div className="text-text-secondary">
                {isSameDay ? (
                  format(startDate, 'yyyy年M月d日(E)', { locale: ja })
                ) : (
                  `${format(startDate, 'yyyy年M月d日(E)', { locale: ja })} 〜 ${format(endDate, 'M月d日(E)', { locale: ja })}`
                )}
              </div>
            </div>
          </div>

          {/* 会議URL */}
          {event.meeting_url && (
            <div className="flex items-start gap-3">
              <Link2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary mb-1">会議URL</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUrlClick}
                    className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
                  >
                    {event.meeting_url}
                  </button>
                  <button
                    onClick={handleUrlClick}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    title="新しいタブで開く"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  クリックで新しいタブで開きます
                </p>
              </div>
            </div>
          )}

          {/* 説明 */}
          {event.description && (
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
              <div>
                <div className="text-sm font-medium text-text-primary mb-1">詳細</div>
                <div className="text-text-secondary text-sm leading-relaxed">
                  {event.description}
                </div>
              </div>
            </div>
          )}

          {/* 作成日時 */}
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-text-primary mb-1">作成日時</div>
              <div className="text-text-secondary text-sm">
                {format(parseISO(event.created_at), 'yyyy年M月d日 HH:mm', { locale: ja })}
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            削除
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}