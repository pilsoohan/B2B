import React, { useState } from 'react';
import { Task } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Plus,
  Calendar,
  Filter,
  Trash2,
} from 'lucide-react';
import { formatDate, getTaskStatusBadge } from '../../utils/formatters';

interface TasksTabProps {
  projectId: string;
  projectName: string;
  clientName: string;
}

export const TasksTab: React.FC<TasksTabProps> = ({
  projectId,
  projectName,
  clientName,
}) => {
  const { tasks, toggleTask, addTask, deleteTask } = useApp();
  const [filter, setFilter] = useState<'전체' | '미완료' | '완료' | '기한초과'>('미완료');
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'normal' | 'low'>('normal');

  const todayStr = new Date().toISOString().split('T')[0];

  const projectTasks = tasks.filter((t) => t.projectId === projectId);

  const filteredTasks = projectTasks.filter((t) => {
    const isOverdue = !t.completed && t.dueDate && t.dueDate < todayStr;
    if (filter === '미완료') return !t.completed;
    if (filter === '완료') return t.completed;
    if (filter === '기한초과') return isOverdue;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      projectId,
      projectName,
      clientName,
      title: newTaskTitle.trim(),
      dueDate: newTaskDueDate || todayStr,
      status: '예정',
      completed: false,
      priority: newTaskPriority,
    });

    setNewTaskTitle('');
    setNewTaskDueDate('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">프로젝트 업무 체크리스트 (Tasks)</h2>
          <p className="text-xs text-neutral-500">
            상담일지에서 자동 추출된 후속 업무 및 수기 등록 업무를 관리합니다. (완료 시 타임라인 자동 기록)
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {isAdding ? '작성 닫기' : '새 업무 추가'}
        </button>
      </div>

      {/* Inline New Task Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="rounded-xl border border-neutral-300 bg-neutral-50/70 p-4 space-y-3"
        >
          <div className="text-xs font-semibold text-neutral-800">새 업무 등록</div>
          <input
            type="text"
            required
            autoFocus
            placeholder="업무 내용을 입력하세요 (예: 3층 회의실 실측 방문 및 샘플칩 전달)"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">마감 기한</label>
              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">우선순위</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
              >
                <option value="normal">보통</option>
                <option value="urgent">긴급 (Urgent)</option>
                <option value="low">낮음</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded bg-neutral-900 px-3.5 py-1 text-xs font-medium text-white hover:bg-neutral-800"
            >
              등록
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 text-xs">
        <span className="text-neutral-400 mr-1 text-[11px] flex items-center gap-1">
          <Filter className="h-3 w-3" />
          상태:
        </span>
        {(['미완료', '전체', '기한초과', '완료'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
              filter === tab
                ? 'bg-neutral-900 text-white font-medium shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100 shadow-xs">
        {filteredTasks.length === 0 ? (
          <div className="py-10 text-center text-xs text-neutral-400">
            해당 조건의 업무가 없습니다.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;
            const displayStatus = isOverdue ? '기한 초과' : task.completed ? '완료' : task.status;

            return (
              <div
                key={task.id}
                className="flex items-center justify-between p-3.5 hover:bg-neutral-50/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="text-neutral-400 hover:text-neutral-900 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>
                  <div>
                    <span
                      className={`text-xs font-semibold ${
                        task.completed ? 'line-through text-neutral-400' : 'text-neutral-900'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.priority === 'urgent' && (
                      <span className="ml-2 rounded bg-red-100 text-red-700 px-1.5 py-0.2 text-[10px] font-bold">
                        긴급
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        기한: {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] border font-medium ${getTaskStatusBadge(
                      displayStatus
                    )}`}
                  >
                    {displayStatus}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-600 transition-opacity"
                    title="업무 삭제"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
