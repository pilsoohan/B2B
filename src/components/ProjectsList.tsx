import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProjectStatus } from '../types';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Tag,
  Calendar,
  Building2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { formatKRW, formatDate, getStatusBadgeClass } from '../utils/formatters';

const STATUS_OPTIONS: (ProjectStatus | '전체')[] = [
  '전체',
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

interface ProjectsListProps {
  onOpenNewProject: () => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({ onOpenNewProject }) => {
  const {
    projects,
    setActiveProjectId,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  } = useApp();

  const [selectedTag, setSelectedTag] = useState<string>('전체');

  // Collect all unique tags
  const allTags = Array.from(new Set(projects.flatMap((p) => p.tags || [])));

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    // Status filter
    if (statusFilter !== '전체' && p.status !== statusFilter) return false;

    // Tag filter
    if (selectedTag !== '전체' && !p.tags.includes(selectedTag)) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchClient = p.clientName.toLowerCase().includes(q);
      const matchSite = p.siteName.toLowerCase().includes(q);
      const matchProduct = p.targetProducts.toLowerCase().includes(q);
      const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchClient && !matchSite && !matchProduct && !matchTag) {
        return false;
      }
    }
    return true;
  });

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setCurrentView('project-detail');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">프로젝트 목록</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            등록된 전체 가구 B2B 프로젝트를 조회하고 관리합니다 (총 {projects.length}개)
          </p>
        </div>
        <button
          onClick={onOpenNewProject}
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          신규 프로젝트 생성
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-neutral-200">
        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs scrollbar-none">
          <span className="text-[11px] font-medium text-neutral-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            상태:
          </span>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-2.5 py-1 text-xs whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-neutral-900 text-white font-medium shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Tag filter selector */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <Tag className="h-3 w-3 text-neutral-400" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
            >
              <option value="전체">모든 태그</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Projects Table / Card List */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-medium">
              <tr>
                <th className="py-3 px-4">고객사 및 프로젝트</th>
                <th className="py-3 px-3">현장</th>
                <th className="py-3 px-3">상태</th>
                <th className="py-3 px-3">납품 예정일</th>
                <th className="py-3 px-3">최신 견적</th>
                <th className="py-3 px-3">태그</th>
                <th className="py-3 px-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-neutral-400">
                    조건에 해당하는 프로젝트가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className="hover:bg-neutral-50/70 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900 group-hover:text-neutral-950">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">{p.clientName}</div>
                    </td>
                    <td className="py-3 px-3 text-neutral-700">
                      <div>{p.siteName}</div>
                      <div className="text-[11px] text-neutral-400 line-clamp-1">{p.siteAddress}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border ${getStatusBadgeClass(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-neutral-800 font-medium">
                      {formatDate(p.deliveryDate)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-neutral-900">
                      {formatKRW(p.latestQuoteAmount)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectProject(p.id);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                      >
                        상세보기
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
