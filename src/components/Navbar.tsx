import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Briefcase,
  LayoutDashboard,
  FolderKanban,
  Building2,
  Plus,
  Search,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewProject }) => {
  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    resetToSampleData,
    activeProjectId,
    projects,
  } = useApp();

  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-xs">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900 tracking-tight text-base">
                B2B 가구 프로젝트 매니저
                <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                  <Sparkles className="h-2.5 w-2.5 text-amber-600" />
                  AI Sync
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">상담 녹음 자동 구조화 & 견적 이력 관리</p>
            </div>
          </button>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-neutral-200">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              대시보드
            </button>
            <button
              onClick={() => setCurrentView('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                currentView === 'projects'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <FolderKanban className="h-4 w-4" />
              프로젝트 목록
            </button>
            <button
              onClick={() => setCurrentView('clients')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                currentView === 'clients'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Building2 className="h-4 w-4" />
              고객사
            </button>
          </nav>
        </div>

        {/* Center/Right: Global Search + Actions */}
        <div className="flex items-center gap-3">
          {/* Global search */}
          <div className="relative w-48 sm:w-64 lg:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="고객사, 프로젝트, 제품, 상담 내용 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-neutral-200 bg-neutral-50 py-1.5 pl-8 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (confirm('모든 데이터를 현실적인 샘플 가구 프로젝트 데이터로 초기화하시겠습니까?')) {
                resetToSampleData();
              }
            }}
            title="샘플 데이터 복원"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
          >
            <RotateCcw className="h-3 w-3" />
            초기화
          </button>

          {/* New Project (Minimal input) button */}
          <button
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            새 프로젝트
          </button>
        </div>
      </div>

      {/* Sub-bar on Project Detail view */}
      {currentView === 'project-detail' && activeProject && (
        <div className="border-t border-neutral-100 bg-neutral-50/70 px-4 py-1.5 sm:px-6 lg:px-8 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-600">
            <span className="font-medium text-neutral-900">{activeProject.clientName}</span>
            <span>&gt;</span>
            <span className="text-neutral-700">{activeProject.name}</span>
          </div>
          <button
            onClick={() => setCurrentView('projects')}
            className="text-neutral-500 hover:text-neutral-900 underline underline-offset-2"
          >
            전체 목록으로 돌아가기
          </button>
        </div>
      )}
    </header>
  );
};
