import React, { useState } from 'react';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  addWeeks,
  parse,
  isSameDay,
  addMonths,
  subMonths,
  differenceInWeeks,
  startOfMonth,
  endOfMonth,
  isSameMonth,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getJSTToday, isJSTBefore } from '../lib/timezone';
import { ChevronLeft, ChevronRight, X, Plus, Filter, ExternalLink } from 'lucide-react';
import { useEpisodes } from '../contexts/EpisodeContext';
import { useCalendarTasks } from '../contexts/CalendarTaskContext';
import { CalendarTask, TASK_TYPE_PRESETS, TASK_TYPE_COLORS, DEFAULT_TASK_COLOR, TEAM_EVENT_TYPES, TEAM_EVENT_COLORS, type TeamEventType } from '../types/calendar-task';
import type { Episode } from '../types/episode';
import { STATUS_COLORS } from '../types/episode';
import TaskModal from './TaskModal';
import { EpisodeModal } from './EpisodeModal';
import { TeamEventModal } from './TeamEventModal';
import { TeamEventDetailModal } from './TeamEventDetailModal';

interface TaskItemProps {
  task: CalendarTask;
  taskIndex: number;
  actualIndex: number; // 実際の表示位置用のインデックス
  onClick: () => void;
}

function TaskItem({ task, taskIndex, actualIndex, onClick }: TaskItemProps) {
  const taskColor = TASK_TYPE_PRESETS.includes(task.task_type as typeof TASK_TYPE_PRESETS[number])
    ? TASK_TYPE_COLORS[task.task_type as keyof typeof TASK_TYPE_COLORS]
    : DEFAULT_TASK_COLOR;

  return (
    <Draggable draggableId={`task-${task.id}`} index={taskIndex}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            top: `${actualIndex * 24}px`,
            height: '20px',
            zIndex: snapshot.isDragging ? 50 : getTaskTypeZIndex(task.task_type),
            touchAction: 'none',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
          onClick={!snapshot.isDragging ? onClick : undefined}
          className={`absolute left-0 right-0 mx-1 px-2 py-1 rounded border ${taskColor.bg} ${taskColor.text} ${taskColor.border} text-xs font-medium transition-all truncate cursor-grab active:cursor-grabbing ${
            snapshot.isDragging ? 'shadow-lg rotate-1 scale-105 opacity-90' : 'hover:brightness-95'
          }`}
        >
          <span className="pointer-events-none">
            {task.program?.program_id && `[${task.program.program_id}] `}
            {task.task_type}
          </span>
        </div>
      )}
    </Draggable>
  );
}

function TeamEventCard({ event, eventIndex, onClick }: TeamEventCardProps) {
  const eventColor = TEAM_EVENT_COLORS[event.task_type as TeamEventType];

  return (
    <Draggable draggableId={`team-event-${event.id}`} index={eventIndex}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            background: eventColor?.gradient || eventColor?.bg,
            touchAction: 'none',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
          onClick={!snapshot.isDragging ? onClick : undefined}
          className={`w-full px-3 py-2 mb-2 text-left rounded-lg border-2 text-xs font-bold transition-all cursor-grab active:cursor-grabbing shadow-md ${
            eventColor?.text || 'text-white'
          } ${
            eventColor?.border || 'border-gray-300'
          } ${
            snapshot.isDragging ? 'rotate-2 scale-110 opacity-90 shadow-xl' : 'hover:shadow-lg hover:scale-105'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 pointer-events-none">
              <div className="font-bold text-sm">{event.task_type}</div>
              {event.description && (
                <div className="text-xs opacity-90 mt-0.5 line-clamp-2">
                  {event.description}
                </div>
              )}
            </div>
            <div className="text-[10px] opacity-75">
              詳細表示
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

function getTaskTypeZIndex(taskType: string): number {
  switch (taskType) {
    case '編集':
      return 30;
    case '試写':
      return 20;
    case 'MA':
      return 10;
    default:
      return 1;
  }
}

interface EpisodeEventProps {
  episode: Episode;
  type: 'due' | 'recording';
  eventIndex: number;
  onClick: () => void;
}

interface TeamEventCardProps {
  event: CalendarTask;
  eventIndex: number;
  onClick: () => void;
}

function EpisodeEvent({ episode, type, eventIndex, onClick }: EpisodeEventProps) {
  const statusColor = STATUS_COLORS[episode.current_status];
  const icon = type === 'due' ? '📅' : 
               episode.episode_type === 'interview' ? '🎙️' : '📹';

  const isOverdue = type === 'due' && episode.due_date && 
    isJSTBefore(episode.due_date, getJSTToday()) && 
    episode.current_status !== '完パケ納品';

  return (
    <Draggable draggableId={`episode-${episode.id}-${type}`} index={eventIndex}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            touchAction: 'none',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
          className={`w-full px-2 py-1 mb-1 text-left rounded border text-xs font-medium transition-all cursor-grab active:cursor-grabbing ${
            isOverdue 
              ? 'bg-red-50 text-red-900 border-red-200' 
              : 'bg-gray-50 text-gray-900 border-gray-200'
          } ${
            snapshot.isDragging ? 'shadow-lg rotate-2 scale-105 opacity-90' : 'hover:brightness-95'
          }`}
          onClick={!snapshot.isDragging ? onClick : undefined}
        >
          <div 
            className="flex items-start gap-1"
            style={{ 
              borderLeftWidth: '4px',
              borderLeftColor: statusColor,
              paddingLeft: '4px'
            }}
          >
            <span className="flex-shrink-0 pointer-events-none">{icon}</span>
            <div className="min-w-0 flex-1 pointer-events-none">
              <div className="font-medium">{episode.episode_id}</div>
              <div className="text-[10px] leading-tight break-words">
                {episode.title}
              </div>
              {type === 'due' && (
                <div className="text-[9px] mt-0.5">
                  {episode.current_status}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}


interface EventModalProps {
  episode: Episode;
  type: 'due' | 'recording';
  onClose: () => void;
  onEdit: () => void;
}

function EventModal({ episode, type, onClose, onEdit }: EventModalProps) {
  const getEventTitle = () => {
    switch (type) {
      case 'due':
        return '納期';
      case 'recording':
        return '収録';
    }
  };

  const getEventDate = () => {
    switch (type) {
      case 'due':
        return episode.due_date;
      case 'recording':
        return episode.recording_date;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">
              {getEventTitle()}情報
              <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: STATUS_COLORS[episode.current_status] + '20',
                  color: STATUS_COLORS[episode.current_status]
                }}
              >
                {episode.current_status}
              </span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <div className="text-sm text-text-secondary font-medium">
              {episode.episode_id}
            </div>
            <h3 className="text-lg font-medium text-text-primary mt-1">
              {episode.title}
            </h3>
            <div className="text-sm text-text-secondary mt-1">
              {episode.episode_type === 'interview' ? 'インタビュー' : 'VTR'} • 
              シーズン{episode.season} エピソード{episode.episode_number}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-text-primary mb-1">
              {getEventTitle()}
            </div>
            <div className="text-text-primary">{getEventDate() || '未定'}</div>
          </div>

          {episode.director && (
            <div>
              <div className="text-sm font-medium text-text-primary mb-1">
                担当ディレクター
              </div>
              <div className="text-text-secondary">{episode.director}</div>
            </div>
          )}

          {type === 'recording' && episode.episode_type === 'interview' && (
            <>
              {episode.guest_name && (
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">
                    ゲスト
                  </div>
                  <div className="text-text-secondary">{episode.guest_name}</div>
                </div>
              )}
              {episode.recording_location && (
                <div>
                  <div className="text-sm font-medium text-text-primary mb-1">
                    収録場所
                  </div>
                  <div className="text-text-secondary">{episode.recording_location}</div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            閉じる
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            編集
          </button>
        </div>
      </div>
    </div>
  );
}

function WeekView({ 
  startDate,
  episodes,
  tasks,
  filter,
  onEditTask,
  onShowEventDetail,
  onAddTeamEvent
}: {
  startDate: Date;
  episodes: Episode[];
  tasks: CalendarTask[];
  filter: CalendarFilter;
  onEditTask: (task: CalendarTask) => void;
  onShowEventDetail: (event: { episode: Episode; type: 'due' | 'recording' }) => void;
  onAddTeamEvent: (date: Date) => void;
}) {
  const weekDays = eachDayOfInterval({
    start: startOfWeek(startDate, { locale: ja }),
    end: endOfWeek(startDate, { locale: ja })
  });

  return (
    <div className="grid grid-cols-7 border-b border-gray-200">
      {weekDays.map((date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const isFirstOfMonth = date.getDate() === 1;
        const dayEvents = episodes.flatMap(episode => {
          const events: { episode: Episode; type: 'due' | 'recording' }[] = [];
          
          if (episode.due_date && isSameDay(parse(episode.due_date, 'yyyy-MM-dd', new Date()), date)) {
            events.push({ episode, type: 'due' });
          }
          if (episode.recording_date && episode.episode_type === 'interview' && 
              isSameDay(parse(episode.recording_date, 'yyyy-MM-dd', new Date()), date)) {
            events.push({ episode, type: 'recording' });
          }
          
          return events;
        });

        const allTasks = tasks
          .filter(task => {
            const taskStart = parse(task.start_date, 'yyyy-MM-dd', new Date());
            const taskEnd = parse(task.end_date, 'yyyy-MM-dd', new Date());
            return (
              isSameDay(date, taskStart) ||
              isSameDay(date, taskEnd) ||
              (date > taskStart && date < taskEnd)
            );
          });

        // フィルター適用
        const filteredDayEvents = filter === 'team-events' || filter === 'tasks' ? [] : dayEvents;
        const filteredTasks = allTasks.filter(task => {
          if (filter === 'episodes') return false;
          if (filter === 'team-events') return task.is_team_event;
          if (filter === 'tasks') return !task.is_team_event;
          return true; // 'all'
        });

        const dayTasks = filteredTasks
          .filter(task => !task.is_team_event)
          .sort((a, b) => {
            const getTypeOrder = (type: string) => {
              switch (type) {
                case '編集': return 0;
                case '試写': return 1;
                case 'MA': return 2;
                default: return 3;
              }
            };
            return getTypeOrder(a.task_type) - getTypeOrder(b.task_type);
          });
          
        const teamEvents = filteredTasks
          .filter(task => task.is_team_event)
          .sort((a, b) => a.task_type.localeCompare(b.task_type));

        const allItems = [
          ...dayEvents.map((event, index) => ({ type: 'event', data: event, index })),
          ...dayTasks.map((task, index) => ({ type: 'task', data: task, index }))
        ];

        return (
          <Droppable droppableId={dateStr} key={dateStr}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`min-h-[120px] p-2 border-r border-gray-200 relative ${
                  !isSameMonth(date, startDate) ? 'bg-gray-50' : ''
                } ${
                  snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <div className={`text-sm font-medium ${
                      isToday(date) ? 'text-white bg-primary rounded-full w-6 h-6 flex items-center justify-center' :
                      date.getDay() === 0 ? 'text-red-500' :
                      date.getDay() === 6 ? 'text-blue-500' :
                      'text-text-primary'
                    }`}>
                      {isFirstOfMonth ? (
                        <span className="flex items-center gap-1">
                          {format(date, 'd')}
                          <span className="text-xs text-text-secondary">
                            {format(date, 'M月')}
                          </span>
                        </span>
                      ) : (
                        format(date, 'd')
                      )}
                    </div>
                  </div>
                  {/* チームイベント追加ボタン */}
                  <button
                    onClick={() => onAddTeamEvent(date)}
                    className="p-1 text-gray-400 hover:text-primary hover:bg-blue-50 transition-colors rounded-full"
                    title="チームイベントを追加"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* チームイベント */}
                <div className="space-y-1">
                  {teamEvents.map((event, index) => (
                    <TeamEventCard
                      key={`team-${event.id}`}
                      event={event}
                      eventIndex={index}
                      onClick={() => onEditTask(event)}
                    />
                  ))}
                </div>

                {/* エピソードイベント */}
                <div className="space-y-1">
                  {filteredDayEvents.map((event, index) => (
                    <EpisodeEvent
                      key={`${event.episode.id}-${event.type}`}
                      episode={event.episode}
                      type={event.type}
                      eventIndex={teamEvents.length + index}
                      onClick={() => onShowEventDetail(event)}
                    />
                  ))}
                </div>

                {/* タスク */}
                <div className="relative mt-1" style={{ minHeight: `${Math.max(1, dayTasks.length) * 24}px` }}>
                  {dayTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      taskIndex={teamEvents.length + filteredDayEvents.length + index}
                      actualIndex={index}
                      onClick={() => onEditTask(task)}
                    />
                  ))}
                </div>
                
                {/* ドロップエリアのプレースホルダー */}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        );
      })}
    </div>
  );
}

type CalendarFilter = 'all' | 'episodes' | 'team-events' | 'tasks';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [isTeamEventModalOpen, setIsTeamEventModalOpen] = useState(false);
  const [isTeamEventDetailOpen, setIsTeamEventDetailOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTask, setSelectedTask] = useState<CalendarTask>();
  const [selectedTeamEvent, setSelectedTeamEvent] = useState<CalendarTask | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{
    episode: Episode;
    type: 'due' | 'recording';
  }>();
  const [selectedEpisode, setSelectedEpisode] = useState<Episode>();
  const [filter, setFilter] = useState<CalendarFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const { episodes, loading: episodesLoading, error: episodesError, updateEpisode } = useEpisodes();
  const { tasks, loading: tasksLoading, error: tasksError, addTask, updateTask, deleteTask } = useCalendarTasks();

  // ドラッグ開始時のデバッグログ
  const handleDragStart = (start: any) => {
    console.log('Drag started:', start);
  };

  const handleDragUpdate = (update: any) => {
    console.log('Drag update:', update);
  };

  const weeks = React.useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { locale: ja });
    const endDate = endOfWeek(endOfMonth(addMonths(monthStart, 1)), { locale: ja });
    const weekCount = differenceInWeeks(endDate, startDate) + 1;
    
    return Array.from({ length: weekCount }, (_, i) => 
      addWeeks(startDate, i)
    );
  }, [currentDate]);

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));


  const handleEditTask = (task: CalendarTask) => {
    if (task.is_team_event) {
      setSelectedTeamEvent(task);
      setIsTeamEventDetailOpen(true);
    } else {
      setSelectedTask(task);
      setSelectedDate(parse(task.start_date, 'yyyy-MM-dd', new Date()));
      setIsTaskModalOpen(true);
    }
  };

  const handleTeamEventDelete = async () => {
    if (selectedTeamEvent) {
      try {
        await deleteTask(selectedTeamEvent.id);
      } catch (error) {
        console.error('Failed to delete team event:', error);
      }
    }
  };

  const handleEditEpisode = (episode: Episode) => {
    setSelectedEpisode(episode);
    setIsEpisodeModalOpen(true);
    setIsEventModalOpen(false);
  };

  const handleSubmit = async (data: { program_id: number | null; task_type: string; start_date: string; end_date: string }) => {
    if (selectedTask) {
      await updateTask(selectedTask.id, data);
    } else {
      await addTask(data);
    }
  };

  const handleTeamEventSubmit = async (eventData: any) => {
    await addTask(eventData);
    setIsTeamEventModalOpen(false);
  };

  const handleAddTeamEvent = (date: Date) => {
    setSelectedDate(date);
    setIsTeamEventModalOpen(true);
  };

  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    console.log('Drag ended:', { destination, source, draggableId });

    if (!destination) {
      console.log('No destination, cancelled drag');
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log('Same position, no change needed');
      return;
    }

    const targetDate = destination.droppableId; // YYYY-MM-DD format
    console.log('Target date:', targetDate);
    
    try {
      if (draggableId.startsWith('episode-')) {
        // エピソードイベントの処理
        const [, episodeId, type] = draggableId.split('-');
        const episode = episodes.find(e => e.id === parseInt(episodeId));
        
        console.log('Updating episode:', { episodeId, type, episode: !!episode });
        
        if (episode && (type === 'due' || type === 'recording')) {
          const updates: { due_date?: string; recording_date?: string } = {};
          
          if (type === 'due') {
            updates.due_date = targetDate;
          } else if (type === 'recording') {
            updates.recording_date = targetDate;
          }
          
          console.log('Episode updates:', updates);
          await updateEpisode(episode.id, updates);
          console.log('Episode updated successfully');
        }
      } else if (draggableId.startsWith('task-')) {
        // 通常タスクの処理
        const taskId = draggableId.replace('task-', '');
        const task = tasks.find(t => t.id === taskId && !t.is_team_event);
        
        console.log('Updating task:', { taskId, task: !!task });
        
        if (task) {
          // タスクの期間を計算（元の期間の長さを維持）
          const originalStart = parse(task.start_date, 'yyyy-MM-dd', new Date());
          const originalEnd = parse(task.end_date, 'yyyy-MM-dd', new Date());
          const duration = Math.max(0, Math.floor((originalEnd.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24)));
          
          const newStart = parse(targetDate, 'yyyy-MM-dd', new Date());
          const newEnd = new Date(newStart.getTime() + duration * 1000 * 60 * 60 * 24);
          
          const taskUpdates = {
            start_date: targetDate,
            end_date: format(newEnd, 'yyyy-MM-dd')
          };
          
          console.log('Task updates:', taskUpdates);
          await updateTask(task.id, taskUpdates);
          console.log('Task updated successfully');
        }
      } else if (draggableId.startsWith('team-event-')) {
        // チームイベントの処理
        const eventId = draggableId.replace('team-event-', '');
        const teamEvent = tasks.find(t => t.id === eventId && t.is_team_event);
        
        console.log('Updating team event:', { eventId, teamEvent: !!teamEvent });
        
        if (teamEvent) {
          // チームイベントの期間を計算（元の期間の長さを維持）
          const originalStart = parse(teamEvent.start_date, 'yyyy-MM-dd', new Date());
          const originalEnd = parse(teamEvent.end_date, 'yyyy-MM-dd', new Date());
          const duration = Math.max(0, Math.floor((originalEnd.getTime() - originalStart.getTime()) / (1000 * 60 * 60 * 24)));
          
          const newStart = parse(targetDate, 'yyyy-MM-dd', new Date());
          const newEnd = new Date(newStart.getTime() + duration * 1000 * 60 * 60 * 24);
          
          const teamEventUpdates = {
            start_date: targetDate,
            end_date: format(newEnd, 'yyyy-MM-dd')
          };
          
          console.log('Team event updates:', teamEventUpdates);
          await updateTask(teamEvent.id, teamEventUpdates);
          console.log('Team event updated successfully');
        }
      }
    } catch (error) {
      console.error('Failed to update item:', error);
      // エラー通知を表示する場合はここに追加
    }
  };

  const loading = episodesLoading || tasksLoading;
  const error = episodesError || tasksError;

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
      <div className="sticky top-0 bg-secondary z-20 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-text-primary">
              カレンダー
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-lg font-medium">
                {format(currentDate, 'yyyy年 M月', { locale: ja })}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-text-secondary flex items-center gap-1">
              <span>💡 カードをドラッグして日付を変更</span>
              <span className="text-[10px] bg-gray-100 px-1 py-0.5 rounded">🖱️ドラッグ可</span>
            </div>
            
            {/* フィルター */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-medium transition-colors ${
                  filter !== 'all' ? 'border-primary text-primary bg-primary/5' : 'border-gray-200 text-text-primary hover:bg-gray-50'
                }`}
              >
                <Filter className="w-3 h-3" />
                フィルター
                {filter !== 'all' && <span className="ml-1 w-2 h-2 bg-primary rounded-full"></span>}
              </button>
              
              {showFilters && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                  {[
                    { value: 'all', label: 'すべて' },
                    { value: 'episodes', label: 'エピソード関連' },
                    { value: 'team-events', label: 'チームイベント' },
                    { value: 'tasks', label: 'タスク' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilter(option.value as CalendarFilter);
                        setShowFilters(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors ${
                        filter === option.value ? 'text-primary font-medium' : 'text-text-primary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DragDropContext 
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdate} 
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="sticky top-0 bg-white z-10 grid grid-cols-7 border-b border-gray-200">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                <div
                  key={day}
                  className={`py-2 text-center text-sm font-medium ${
                    index === 0 ? 'text-red-500' : 
                    index === 6 ? 'text-blue-500' : 'text-text-primary'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {weeks.map((weekStart, index) => (
              <WeekView
                key={index}
                startDate={weekStart}
                episodes={episodes}
                tasks={tasks}
                filter={filter}
                onEditTask={handleEditTask}
                onShowEventDetail={(event) => {
                  setSelectedEvent(event);
                  setIsEventModalOpen(true);
                }}
                onAddTeamEvent={handleAddTeamEvent}
              />
            ))}
          </div>
        </div>
      </DragDropContext>

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          selectedDate={selectedDate}
          task={selectedTask}
          onSubmit={handleSubmit}
        />
      )}

      {isEventModalOpen && selectedEvent && (
        <EventModal
          episode={selectedEvent.episode}
          type={selectedEvent.type}
          onClose={() => setIsEventModalOpen(false)}
          onEdit={() => handleEditEpisode(selectedEvent.episode)}
        />
      )}

      {isEpisodeModalOpen && selectedEpisode && (
        <EpisodeModal
          isOpen={isEpisodeModalOpen}
          onClose={() => setIsEpisodeModalOpen(false)}
          episode={selectedEpisode}
        />
      )}

      {isTeamEventModalOpen && selectedDate && (
        <TeamEventModal
          isOpen={isTeamEventModalOpen}
          onClose={() => setIsTeamEventModalOpen(false)}
          selectedDate={selectedDate}
          onSubmit={handleTeamEventSubmit}
        />
      )}

      {isTeamEventDetailOpen && selectedTeamEvent && (
        <TeamEventDetailModal
          isOpen={isTeamEventDetailOpen}
          onClose={() => {
            setIsTeamEventDetailOpen(false);
            setSelectedTeamEvent(null);
          }}
          event={selectedTeamEvent}
          onDelete={handleTeamEventDelete}
        />
      )}
    </div>
  );
}