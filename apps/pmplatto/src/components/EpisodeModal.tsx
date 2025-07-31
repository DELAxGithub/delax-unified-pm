import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Episode, NewEpisode, UpdateEpisode, EpisodeStatus, STATUS_ORDER } from '../types/episode';
import { getAvailableStatuses } from '../lib/dataAdapters';

interface EpisodeModalProps {
  episode: Episode | null;
  onClose: () => void;
  onSave: (episode: NewEpisode | UpdateEpisode) => Promise<void>;
}

export function EpisodeModal({ episode, onClose, onSave }: EpisodeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    episode_id: '',
    title: '',
    episode_type: 'interview' as 'interview' | 'vtr',
    season: 1,
    episode_number: 1,
    script_url: '',
    current_status: '台本作成中' as EpisodeStatus,
    director: '',
    due_date: '',
    guest_name: '',
    recording_date: '',
    recording_location: '',
    material_status: '△' as '○' | '△' | '×'
  });

  useEffect(() => {
    if (episode) {
      setFormData({
        episode_id: episode.episode_id,
        title: episode.title,
        episode_type: episode.episode_type,
        season: episode.season,
        episode_number: episode.episode_number,
        script_url: episode.script_url || '',
        current_status: episode.current_status,
        director: episode.director || '',
        due_date: episode.due_date ? new Date(episode.due_date).toISOString().split('T')[0] : '',
        guest_name: episode.guest_name || '',
        recording_date: episode.recording_date ? new Date(episode.recording_date).toISOString().split('T')[0] : '',
        recording_location: episode.recording_location || '',
        material_status: episode.material_status || '△'
      });
    }
  }, [episode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data: NewEpisode | UpdateEpisode = {
        episode_id: formData.episode_id,
        title: formData.title,
        episode_type: formData.episode_type,
        season: formData.season,
        episode_number: formData.episode_number,
        script_url: formData.script_url || null,
        current_status: formData.current_status,
        director: formData.director || null,
        due_date: formData.due_date || null,
        guest_name: formData.episode_type === 'interview' ? formData.guest_name || null : null,
        recording_date: formData.episode_type === 'interview' && formData.recording_date ? formData.recording_date : null,
        recording_location: formData.episode_type === 'interview' ? formData.recording_location || null : null,
        material_status: formData.episode_type === 'vtr' ? formData.material_status : null
      };

      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving episode:', error);
      alert('エピソードの保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-primary">
            {episode ? 'エピソード編集' : '新規エピソード作成'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                エピソードID *
              </label>
              <input
                type="text"
                required
                value={formData.episode_id}
                onChange={(e) => setFormData({ ...formData, episode_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="LA-INT001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                タイプ *
              </label>
              <select
                required
                value={formData.episode_type}
                onChange={(e) => setFormData({ ...formData, episode_type: e.target.value as 'interview' | 'vtr' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="interview">インタビュー</option>
                <option value="vtr">VTR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              タイトル *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                シーズン *
              </label>
              <select
                required
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value={1}>シーズン1</option>
                <option value={2}>シーズン2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                エピソード番号 *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.episode_number}
                onChange={(e) => setFormData({ ...formData, episode_number: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              台本URL
            </label>
            <input
              type="url"
              value={formData.script_url}
              onChange={(e) => setFormData({ ...formData, script_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="https://docs.google.com/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                ステータス *
              </label>
              <select
                required
                value={formData.current_status}
                onChange={(e) => setFormData({ ...formData, current_status: e.target.value as EpisodeStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {getAvailableStatuses().map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                納期
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              担当ディレクター
            </label>
            <input
              type="text"
              value={formData.director}
              onChange={(e) => setFormData({ ...formData, director: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* インタビュー用フィールド */}
          {formData.episode_type === 'interview' && (
            <>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-text-primary mb-3">インタビュー情報</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      ゲスト名
                    </label>
                    <input
                      type="text"
                      value={formData.guest_name}
                      onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        収録日
                      </label>
                      <input
                        type="date"
                        value={formData.recording_date}
                        onChange={(e) => setFormData({ ...formData, recording_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        収録場所
                      </label>
                      <input
                        type="text"
                        value={formData.recording_location}
                        onChange={(e) => setFormData({ ...formData, recording_location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VTR用フィールド */}
          {formData.episode_type === 'vtr' && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-text-primary mb-3">VTR情報</h3>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  素材準備状況
                </label>
                <select
                  value={formData.material_status}
                  onChange={(e) => setFormData({ ...formData, material_status: e.target.value as '○' | '△' | '×' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="○">○ (完了)</option>
                  <option value="△">△ (進行中)</option>
                  <option value="×">× (未着手)</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
            >
              {isSubmitting ? '保存中...' : episode ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}