import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectHeader } from './ProjectHeader';
import { OverviewTab } from './OverviewTab';
import { TimelineTab } from './TimelineTab';
import { ConsultationsTab } from './ConsultationsTab';
import { QuotesTab } from './QuotesTab';
import { ChangesTab } from './ChangesTab';
import { FilesTab } from './FilesTab';
import { TasksTab } from './TasksTab';
import { AfterServiceTab } from './AfterServiceTab';
import { ProjectAiAssistant } from './ProjectAiAssistant';
import { FinalSummaryView } from './FinalSummaryView';
import { Quote } from '../../types';
import {
  FileText,
  Clock,
  MessageSquare,
  FileCheck,
  TrendingUp,
  FolderOpen,
  CheckSquare,
  Wrench,
  Sparkles,
  Award,
} from 'lucide-react';

type TabKey =
  | 'overview'
  | 'timeline'
  | 'consultations'
  | 'quotes'
  | 'changes'
  | 'files'
  | 'tasks'
  | 'afterservice'
  | 'ai'
  | 'finalsummary';

interface ProjectDetailViewProps {
  onOpenNewConsultation: () => void;
  onOpenNewQuote: () => void;
  onOpenNewFile: () => void;
  onOpenQuoteCompare: (prevQuote: Quote, nextQuote: Quote) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  onOpenNewConsultation,
  onOpenNewQuote,
  onOpenNewFile,
  onOpenQuoteCompare,
}) => {
  const { projects, clients, activeProjectId, consultations, quotes, files, tasks } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [showAiDrawer, setShowAiDrawer] = useState(false);

  const project = projects.find((p) => p.id === activeProjectId) || projects[0];
  const client = clients.find((c) => c.id === project?.clientId);

  if (!project) {
    return (
      <div className="py-20 text-center text-xs text-neutral-500">
        선택된 프로젝트가 없습니다.
      </div>
    );
  }

  // Count metrics for tabs
  const consultCount = consultations.filter((c) => c.projectId === project.id).length;
  const quoteCount = quotes.filter((q) => q.projectId === project.id).length;
  const fileCount = files.filter((f) => f.projectId === project.id).length;
  const taskCount = tasks.filter((t) => t.projectId === project.id && !t.completed).length;

  const tabs: { key: TabKey; label: string; icon: any; badge?: number }[] = [
    { key: 'overview', label: '개요 (Overview)', icon: FileText },
    { key: 'timeline', label: '타임라인 (Timeline)', icon: Clock },
    { key: 'consultations', label: '상담일지 (Consultations)', icon: MessageSquare, badge: consultCount },
    { key: 'quotes', label: '견적서 (Quotes)', icon: FileCheck, badge: quoteCount },
    { key: 'changes', label: '변경사항 (Changes)', icon: TrendingUp },
    { key: 'files', label: '파일 (Files)', icon: FolderOpen, badge: fileCount },
    { key: 'tasks', label: '업무 (Tasks)', icon: CheckSquare, badge: taskCount },
    { key: 'afterservice', label: 'A/S 및 추가요청', icon: Wrench },
    { key: 'ai', label: 'Project AI Q&A', icon: Sparkles },
    { key: 'finalsummary', label: '최종 결산 보고서', icon: Award },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Project Header with 4 Core Metrics & Status selector */}
      <ProjectHeader
        project={project}
        onOpenConsultation={onOpenNewConsultation}
        onOpenQuote={onOpenNewQuote}
        onOpenAiChat={() => {
          setActiveTab('ai');
          setShowAiDrawer(true);
        }}
        onOpenFinalSummary={() => setActiveTab('finalsummary')}
      />

      {/* 2. Navigation Tabs Bar */}
      <div className="border-b border-neutral-200 bg-white rounded-t-xl px-2">
        <div className="flex items-center gap-1 overflow-x-auto text-xs scrollbar-none py-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? 'bg-neutral-700 text-white' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Active Tab Content Area */}
      <div className="bg-white rounded-b-xl border border-neutral-200 p-6 shadow-xs min-h-[400px]">
        {activeTab === 'overview' && (
          <OverviewTab
            project={project}
            client={client}
            onOpenConsultation={onOpenNewConsultation}
          />
        )}

        {activeTab === 'timeline' && <TimelineTab projectId={project.id} />}

        {activeTab === 'consultations' && (
          <ConsultationsTab
            projectId={project.id}
            onOpenNewConsultation={onOpenNewConsultation}
          />
        )}

        {activeTab === 'quotes' && (
          <QuotesTab
            projectId={project.id}
            onOpenNewQuote={onOpenNewQuote}
            onOpenQuoteCompare={onOpenQuoteCompare}
          />
        )}

        {activeTab === 'changes' && <ChangesTab projectId={project.id} />}

        {activeTab === 'files' && (
          <FilesTab projectId={project.id} onOpenNewFile={onOpenNewFile} />
        )}

        {activeTab === 'tasks' && (
          <TasksTab
            projectId={project.id}
            projectName={project.name}
            clientName={project.clientName}
          />
        )}

        {activeTab === 'afterservice' && <AfterServiceTab projectId={project.id} />}

        {activeTab === 'ai' && (
          <div className="h-[600px]">
            <ProjectAiAssistant project={project} />
          </div>
        )}

        {activeTab === 'finalsummary' && <FinalSummaryView project={project} />}
      </div>
    </div>
  );
};
