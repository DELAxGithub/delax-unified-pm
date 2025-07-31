import React from 'react';
import { EpisodeStatus, STATUS_COLORS, STATUS_ORDER } from '../types/episode';
import { StatusAdapter } from '../lib/dataAdapters';

interface StatusBadgeProps {
  status: EpisodeStatus;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, showProgress = false, size = 'md' }: StatusBadgeProps) {
  const statusIndex = STATUS_ORDER.indexOf(status);
  // PMPlattoの実際のステータスに変換して進捗計算
  const programStatus = StatusAdapter.toProgram(status);
  const progress = StatusAdapter.getProgress(programStatus);
  const color = STATUS_COLORS[status];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
        style={{ 
          backgroundColor: color + '20',
          color: color,
          borderColor: color,
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
      >
        {status}
      </span>
      {showProgress && (
        <div className="flex items-center gap-1">
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${progress}%`,
                backgroundColor: color
              }}
            />
          </div>
          <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
}