import React, { useState } from 'react';
import { X, Calendar, Clock, Globe, Users, Video, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { TEAM_EVENT_TYPES, TEAM_EVENT_COLORS, type TeamEventType, type NewCalendarTask } from '../types/calendar-task';

interface TeamEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSubmit: (event: NewCalendarTask) => Promise<void>;
}

const URL_REQUIRED_TYPES = ['🌐 全体会議', '💼 制作会議'];

export function TeamEventModal({ isOpen, onClose, selectedDate, onSubmit }: TeamEventModalProps) {
  const [formData, setFormData] = useState({
    task_type: TEAM_EVENT_TYPES[0],
    start_date: format(selectedDate, 'yyyy-MM-dd'),
    end_date: format(selectedDate, 'yyyy-MM-dd'),
    meeting_url: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlError, setUrlError] = useState('');

  if (!isOpen) return null;

  const requiresUrl = URL_REQUIRED_TYPES.includes(formData.task_type as TeamEventType);

  const validateUrl = (url: string): boolean => {
    if (!url) return !requiresUrl;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (requiresUrl && !formData.meeting_url) {
      setUrlError('このイベントタイプには会議URLが必要です');
      return;
    }

    if (formData.meeting_url && !validateUrl(formData.meeting_url)) {
      setUrlError('有効なURL（https://...）を入力してください');
      return;
    }

    setIsSubmitting(true);
    setUrlError('');

    try {
      const eventData: NewCalendarTask = {
        program_id: null,
        task_type: formData.task_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        meeting_url: formData.meeting_url || null,
        description: formData.description || null,
        is_team_event: true,
      };

      await onSubmit(eventData);
      onClose();
    } catch (error) {
      console.error('Failed to create team event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case '🌐 全体会議': return <Globe className="w-5 h-5" />;
      case '💼 制作会議': return <Users className="w-5 h-5" />;
      case '🎬 スタジオ収録': return <Video className="w-5 h-5" />;
      case '⚠️ 重要': return <AlertTriangle className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              チームイベントを作成
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* イベントタイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              イベントタイプ
            </label>
            <div className="space-y-2">
              {TEAM_EVENT_TYPES.map((type) => {
                const colors = TEAM_EVENT_COLORS[type];
                return (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="eventType"
                      value={type}
                      checked={formData.task_type === type}
                      onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                      className="text-primary focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      {getEventIcon(type)}
                      <span className="font-medium">{type}</span>
                      {URL_REQUIRED_TYPES.includes(type) && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          URL必須
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 日付選択 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                開始日
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                終了日
              </label>
              <input
                type="date"
                value={formData.end_date}
                min={formData.start_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* 会議URL（条件付き表示） */}
          {requiresUrl && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                会議URL *
              </label>
              <input
                type="url"
                value={formData.meeting_url}
                onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                placeholder="https://meet.google.com/... または https://zoom.us/..."
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  urlError ? 'border-red-300' : 'border-gray-300'
                }`}
                required={requiresUrl}
              />
              {urlError && (
                <p className="text-red-600 text-sm mt-1">{urlError}</p>
              )}
            </div>
          )}

          {/* 説明（オプション） */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              説明（任意）
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="イベントの詳細や注意事項..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isSubmitting ? '作成中...' : 'イベントを作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}