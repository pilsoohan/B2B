import React, { useState } from 'react';
import { Project, ProjectStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  DollarSign,
  Clock,
  ChevronDown,
  Sparkles,
  Tag,
  Plus,
  X,
  FileCheck,
  ArrowRight,
} from 'lucide-react';
import { formatKRW, formatDate, getStatusBadgeClass } from '../../utils/formatters';

const ALL_STATUSES: ProjectStatus[] = [
  '상담',
  '견적',
  '견적 조정',
  '발주 확정',
  '납품 준비',
  '납품',
  '설치·검수',
  'A/S·추가 요청',
  '완료',
];

interface ProjectHeaderProps {
  project: Project;
  onOpenConsultation: () => void;
  onOpenQuote: () => void;
  onOpenAiChat: () => void;
  onOpenFinalSummary: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onOpenConsultation,
  onOpenQuote,
  onOpenAiChat,
  onOpenFinalSummary,
}) => {
  const { changeProjectStatus, updateProject, tasks, consultations } = useApp();
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Find next pending task for this project
  const projectTasks = tasks.filter((t) => t.projectId === project.id && !t.completed);
  const nextTask = projectTasks[0];

  // Check if latest consultation suggested a status change different from current
  const latestConsultation = consultations.filter((c) => c.projectId === project.id)[0];
  const suggestedStatus =
    latestConsultation?.suggestedStatusChange &&
    latestConsultation.suggestedStatusChange !== project.status
      ? latestConsultation.suggestedStatusChange
      : null;

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().replace(/^#/, '');
    if (!project.tags.includes(cleanTag)) {
      updateProject(project.id, { tags: [...project.tags, cleanTag] });
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateProject(project.id, {
      tags: project.tags.filter((t) => t !== tagToRemove),
    });
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs space-y-5">
      {/* Top Title & Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-1">
            <span>{project.clientName}</span>
            <span>·</span>
            <span>{project.siteName}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            {project.name}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {project.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700"
              >
                #{t}
                <button
                  onClick={() => handleRemoveTag(t)}
                  className="text-neutral-400 hover:text-neutral-700 ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {isAddingTag ? (
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="태그 입력..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTag();
                    if (e.key === 'Escape') setIsAddingTag(false);
                  }}
                  className="w-24 rounded border border-neutral-300 px-1.5 py-0.5 text-xs focus:outline-none focus:border-neutral-900"
                />
                <button
                  onClick={handleAddTag}
                  className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] text-white"
                >
                  추가
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="inline-flex items-center gap-1 rounded border border-dashed border-neutral-300 px-2 py-0.5 text-xs text-neutral-500 hover:border-neutral-500 hover:text-neutral-800"
              >
                <Plus className="h-3 w-3" />
                태그 추가
              </button>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAiChat}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-800 shadow-2xs hover:bg-neutral-50 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            Project AI Q&A
          </button>

          <button
            onClick={onOpenQuote}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-800 shadow-2xs hover:bg-neutral-50 transition-colors"
          >
            <FileCheck className="h-3.5 w-3.5 text-neutral-600" />
            견적 등록 / 비교
          </button>

          <button
            onClick={onOpenConsultation}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            상담 입력 · AI 분석
          </button>
        </div>
      </div>

      {/* AI Status Proposal Banner (if AI proposed status change) */}
      {suggestedStatus && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              최신 상담 분석 결과, 프로젝트 상태를 <strong className="font-semibold">[{suggestedStatus}]</strong>(으)로
              변경하는 것이 제안되었습니다.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeProjectStatus(project.id, suggestedStatus)}
              className="rounded bg-blue-600 px-2.5 py-1 text-white font-medium hover:bg-blue-700"
            >
              제안 수락
            </button>
          </div>
        </div>
      )}

      {/* The 4 Core Priority Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Project Status (Directly changeable) */}
        <div className="relative rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span>프로젝트 상태</span>
            <span className="text-[10px] text-neutral-400">클릭하여 변경</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`w-full flex items-center justify-between rounded-md border px-3 py-1.5 text-xs font-semibold tracking-tight transition-colors ${getStatusBadgeClass(
                project.status
              )}`}
            >
              <span>{project.status}</span>
              <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-70" />
            </button>

            {/* Status Dropdown Menu */}
            {showStatusDropdown && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowStatusDropdown(false)}
                />
                <div className="absolute left-0 top-full mt-1 w-44 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg z-30">
                  <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase">
                    상태 직접 선택
                  </div>
                  {ALL_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        changeProjectStatus(project.id, status);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-neutral-50 ${
                        project.status === status ? 'font-bold text-neutral-900 bg-neutral-50' : 'text-neutral-700'
                      }`}
                    >
                      <span>{status}</span>
                      {project.status === status && <span className="text-blue-600 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Metric 2: 납품 예정일 */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span>납품 예정일</span>
            <Calendar className="h-3.5 w-3.5 text-neutral-400" />
          </div>
          <div className="text-sm font-bold text-neutral-900">
            {formatDate(project.deliveryDate)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            {project.deliveryDate === '미정' ? '상담을 통해 확정' : '현장 조립/설치 예정'}
          </span>
        </div>

        {/* Metric 3: 최신 견적 금액 */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span>최신 견적 금액</span>
            <DollarSign className="h-3.5 w-3.5 text-neutral-400" />
          </div>
          <div className="text-sm font-bold text-neutral-900">
            {formatKRW(project.latestQuoteAmount)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            예산: {project.budget || '미정'} (VAT 별도)
          </span>
        </div>

        {/* Metric 4: 다음 할 일 */}
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span>다음 할 일</span>
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
          </div>
          {nextTask ? (
            <div>
              <div className="text-xs font-semibold text-neutral-900 line-clamp-1">
                {nextTask.title}
              </div>
              <span className="text-[11px] text-neutral-500 mt-0.5 block">
                마감: {formatDate(nextTask.dueDate)}
              </span>
            </div>
          ) : (
            <div>
              <div className="text-xs font-medium text-neutral-400">예정된 업무 없음</div>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">모든 업무 완료</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
