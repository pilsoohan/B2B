import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Mic,
  FileText,
  Building2,
  ChevronRight,
  Tag,
} from 'lucide-react';
import { formatKRW, formatDate, getStatusBadgeClass } from '../utils/formatters';

interface DashboardProps {
  onOpenNewProject: () => void;
  onOpenConsultation: (projectId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenNewProject,
  onOpenConsultation,
}) => {
  const {
    projects,
    tasks,
    consultations,
    toggleTask,
    setActiveProjectId,
    setCurrentView,
    searchQuery,
  } = useApp();

  const [taskTab, setTaskTab] = useState<'today' | 'overdue' | 'upcoming'>('today');

  // Dates
  const todayStr = new Date().toISOString().split('T')[0];

  // Task filtering
  const overdueTasks = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < todayStr
  );
  const todayTasks = tasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate === todayStr
  );
  const upcomingTasks = tasks.filter(
    (t) => !t.completed && (!t.dueDate || t.dueDate > todayStr)
  );

  // Active projects (exclude '완료')
  const ongoingProjects = projects.filter((p) => p.status !== '완료');
  const filteredProjects = ongoingProjects.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.clientName.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.targetProducts.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleProjectClick = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView('project-detail');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            가구 B2B 프로젝트 대시보드
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            진행 중 프로젝트 <span className="font-semibold text-neutral-800">{ongoingProjects.length}</span>건 · 
            오늘 처리 업무 <span className="font-semibold text-neutral-800">{todayTasks.length}</span>건 · 
            기한 초과 <span className={`font-semibold ${overdueTasks.length > 0 ? 'text-red-600' : 'text-neutral-800'}`}>{overdueTasks.length}</span>건
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            새 프로젝트 생성
          </button>
        </div>
      </div>

      {/* Section 1: Tasks Overview (오늘 할 일 + 기한 초과 + 예정 업무) */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">업무 현황 (Tasks)</h2>
            <span className="text-xs text-neutral-400">상담 및 견적 후속 조치 자동 연계</span>
          </div>

          {/* Task Category Tabs */}
          <div className="flex items-center rounded-lg bg-neutral-100 p-1 text-xs">
            <button
              onClick={() => setTaskTab('today')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                taskTab === 'today'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              오늘 할 일
              <span className="ml-1 rounded-full bg-neutral-200 px-1.5 py-0.2 text-[10px] text-neutral-700">
                {todayTasks.length}
              </span>
            </button>

            <button
              onClick={() => setTaskTab('overdue')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                taskTab === 'overdue'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5 text-red-600" />
              기한 초과
              <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                overdueTasks.length > 0 ? 'bg-red-100 text-red-700 font-bold' : 'bg-neutral-200 text-neutral-700'
              }`}>
                {overdueTasks.length}
              </span>
            </button>

            <button
              onClick={() => setTaskTab('upcoming')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition-colors ${
                taskTab === 'upcoming'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              예정 업무
              <span className="ml-1 rounded-full bg-neutral-200 px-1.5 py-0.2 text-[10px] text-neutral-700">
                {upcomingTasks.length}
              </span>
            </button>
          </div>
        </div>

        {/* Task List items */}
        <div className="mt-4 divide-y divide-neutral-100">
          {taskTab === 'today' && (
            todayTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-500">
                오늘 마감인 업무가 없습니다. 편안한 하루 되세요!
              </div>
            ) : (
              todayTasks.map((t) => (
                <TaskRow key={t.id} task={t} onToggle={toggleTask} onSelectProject={handleProjectClick} />
              ))
            )
          )}

          {taskTab === 'overdue' && (
            overdueTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-500">
                기한 초과된 지연 업무가 없습니다.
              </div>
            ) : (
              overdueTasks.map((t) => (
                <TaskRow key={t.id} task={t} onToggle={toggleTask} onSelectProject={handleProjectClick} isOverdue />
              ))
            )
          )}

          {taskTab === 'upcoming' && (
            upcomingTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-500">
                예정된 업무가 없습니다.
              </div>
            ) : (
              upcomingTasks.map((t) => (
                <TaskRow key={t.id} task={t} onToggle={toggleTask} onSelectProject={handleProjectClick} />
              ))
            )
          )}
        </div>
      </div>

      {/* Section 2: Ongoing Projects (진행 중 프로젝트) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
              진행 중 프로젝트 ({filteredProjects.length})
            </h2>
            <p className="text-xs text-neutral-500">
              카드를 클릭하면 상세 타임라인, 상담 녹음, 견적 이력으로 이동합니다.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('projects')}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900 inline-flex items-center gap-1"
          >
            전체 프로젝트 보기
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center bg-white">
            <Building2 className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
            <p className="text-xs text-neutral-600 font-medium">진행 중인 프로젝트가 없거나 검색 결과가 없습니다.</p>
            <button
              onClick={onOpenNewProject}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              첫 프로젝트 생성하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => {
              // Get next task for this project
              const projTasks = tasks.filter((t) => t.projectId === project.id && !t.completed);
              const nextTask = projTasks[0];

              // Get recent consultation change
              const projConsults = consultations.filter((c) => c.projectId === project.id);
              const recentChange = projConsults.flatMap((c) => c.changes)[0];

              return (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="group relative flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs hover:border-neutral-400 hover:shadow-xs transition-all cursor-pointer"
                >
                  <div>
                    {/* Top row: Client name + Status Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-neutral-500 tracking-tight">
                        {project.clientName}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border ${getStatusBadgeClass(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </div>

                    {/* Project Name */}
                    <h3 className="text-sm font-bold text-neutral-900 group-hover:text-neutral-950 transition-colors line-clamp-1">
                      {project.name}
                    </h3>

                    {/* Target products preview */}
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                      {project.targetProducts}
                    </p>

                    {/* Metrics Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-neutral-50 p-2.5 text-xs border border-neutral-100">
                      <div>
                        <span className="text-[10px] text-neutral-400 block">납품 예정일</span>
                        <span className="font-semibold text-neutral-800">
                          {formatDate(project.deliveryDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">최신 견적 금액</span>
                        <span className="font-semibold text-neutral-900">
                          {formatKRW(project.latestQuoteAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Next Task section */}
                    <div className="mt-3 pt-3 border-t border-neutral-100 text-xs">
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500 mb-1">
                        <Clock className="h-3 w-3 text-neutral-400" />
                        <span>다음 할 일</span>
                      </div>
                      {nextTask ? (
                        <p className="text-xs font-medium text-neutral-800 line-clamp-1">
                          {nextTask.title}
                          <span className="ml-1 text-[10px] text-neutral-400">({formatDate(nextTask.dueDate)})</span>
                        </p>
                      ) : (
                        <p className="text-xs text-neutral-400 italic">등록된 예정 업무 없음</p>
                      )}
                    </div>

                    {/* Recent Changes summary */}
                    <div className="mt-2 text-xs">
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500 mb-0.5">
                        <TrendingUp className="h-3 w-3 text-neutral-400" />
                        <span>최근 변경사항</span>
                      </div>
                      {recentChange ? (
                        <p className="text-xs text-neutral-700 bg-amber-50/70 border border-amber-100 rounded px-2 py-1">
                          <span className="font-medium text-amber-900">{recentChange.item}:</span>{' '}
                          <span className="line-through text-neutral-400">{recentChange.before}</span> →{' '}
                          <span className="font-semibold text-neutral-900">{recentChange.after}</span>
                        </p>
                      ) : (
                        <p className="text-xs text-neutral-400 italic">최근 변경 이력 없음</p>
                      )}
                    </div>
                  </div>

                  {/* Card bottom: Tags + Quick Action button */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-0.5 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600"
                        >
                          <Tag className="h-2.5 w-2.5 text-neutral-400" />
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenConsultation(project.id);
                      }}
                      className="inline-flex items-center gap-1 rounded bg-neutral-100 hover:bg-neutral-200 px-2 py-1 text-[11px] font-medium text-neutral-800 transition-colors"
                    >
                      <Mic className="h-3 w-3 text-neutral-600" />
                      상담 기록
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

interface TaskRowProps {
  task: any;
  onToggle: (id: string) => void;
  onSelectProject: (projectId: string) => void;
  isOverdue?: boolean;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, onToggle, onSelectProject, isOverdue }) => {
  return (
    <div className="flex items-center justify-between py-2.5 px-1 hover:bg-neutral-50/60 rounded transition-colors group">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className="text-neutral-400 hover:text-neutral-900 transition-colors"
        >
          {task.completed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </button>
        <div>
          <p className={`text-xs font-medium text-neutral-900 ${task.completed ? 'line-through text-neutral-400' : ''}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
            <button
              onClick={() => onSelectProject(task.projectId)}
              className="text-neutral-600 hover:underline font-medium"
            >
              {task.clientName} · {task.projectName}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded ${
            isOverdue
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'text-neutral-500'
          }`}
        >
          {formatDate(task.dueDate)}
        </span>
      </div>
    </div>
  );
};
