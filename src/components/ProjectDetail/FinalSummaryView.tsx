import React, { useState } from 'react';
import { Project, ProjectFinalSummary } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Sparkles,
  Award,
  TrendingUp,
  Package,
  DollarSign,
  Lightbulb,
  BookOpen,
  Loader2,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { formatKRW, formatDate } from '../../utils/formatters';

interface FinalSummaryViewProps {
  project: Project;
  onClose?: () => void;
}

export const FinalSummaryView: React.FC<FinalSummaryViewProps> = ({ project, onClose }) => {
  const { consultations, quotes, files, tasks, setProjectFinalSummary } = useApp();
  const [loading, setLoading] = useState(false);

  const summary = project.finalSummary;

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const projConsultations = consultations.filter((c) => c.projectId === project.id);
      const projQuotes = quotes.filter((q) => q.projectId === project.id);
      const projFiles = files.filter((f) => f.projectId === project.id);
      const projTasks = tasks.filter((t) => t.projectId === project.id);

      const res = await fetch('/api/gemini/final-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          consultations: projConsultations,
          quotes: projQuotes,
          files: projFiles,
          tasks: projTasks,
        }),
      });

      if (!res.ok) {
        throw new Error('Summary generation failed');
      }

      const data: ProjectFinalSummary = await res.json();
      setProjectFinalSummary(project.id, data);
    } catch (err) {
      console.error('Final summary generation error:', err);
      alert('결산 보고서 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold text-neutral-900">
              프로젝트 최종 결산 및 회고 (Final Summary)
            </h2>
          </div>
          <p className="text-xs text-neutral-500">
            상담·견적·설치·A/S 전체 프로세스를 종합 분석하여 후속 영업 기회 및 교훈(Lessons Learned)을 도출합니다.
          </p>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 disabled:bg-neutral-300 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              AI 분석 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              {summary ? 'AI 결산서 재분석' : 'AI 최종 결산서 생성'}
            </>
          )}
        </button>
      </div>

      {!summary && !loading && (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center space-y-3">
          <Award className="mx-auto h-10 w-10 text-neutral-300" />
          <h3 className="text-sm font-bold text-neutral-800">아직 생성된 결산 보고서가 없습니다</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            프로젝트 완료 시 AI가 전체 상담 이력, 견적 증감 내역, 주요 변경점을 분석하여 총 매출,
            향후 확장 기회 및 회고(Lessons Learned)를 자동으로 구조화해 드립니다.
          </p>
          <button
            onClick={handleGenerateSummary}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-neutral-800"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            지금 AI 결산 보고서 생성하기
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center space-y-3">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-neutral-800" />
          <p className="text-xs font-semibold text-neutral-800">
            프로젝트 전체 이력을 정밀하게 종합 분석하고 있습니다...
          </p>
          <p className="text-[11px] text-neutral-500">
            상담일지 대조, 견적서 버전 비교, 향후 추가 영업 기회 추출 중
          </p>
        </div>
      )}

      {summary && !loading && (
        <div className="space-y-6">
          {/* Top Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] text-neutral-500 block mb-1">총 상담 / 미팅 횟수</span>
              <div className="text-xl font-bold text-neutral-900">{summary.consultationCount}회</div>
              <span className="text-[10px] text-neutral-400 mt-1 block">누적 상담일지 전수 분석</span>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] text-neutral-500 block mb-1">최종 매출 금액</span>
              <div className="text-xl font-bold text-neutral-900">{formatKRW(summary.finalRevenue)}</div>
              <span className="text-[10px] text-neutral-400 mt-1 block">VAT 별도 확정 금액</span>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs">
              <span className="text-[11px] text-neutral-500 block mb-1">최종 납품 수량</span>
              <div className="text-xl font-bold text-neutral-900">{summary.finalQuantity} EA</div>
              <span className="text-[10px] text-neutral-400 mt-1 block">{summary.finalProducts}</span>
            </div>
          </div>

          {/* Project Overview Box */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              프로젝트 총괄 개요
            </h3>
            <p className="text-xs text-neutral-800 leading-relaxed whitespace-pre-line">
              {summary.overview}
            </p>
          </div>

          {/* Quotes and Changes Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>견적 변동 이력 요약</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded border border-neutral-100 whitespace-pre-line">
                {summary.quoteHistorySummary}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                <Package className="h-4 w-4 text-amber-600" />
                <span>주요 협의 변경사항 요약</span>
              </div>
              <p className="text-xs text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded border border-neutral-100 whitespace-pre-line">
                {summary.majorChangesSummary}
              </p>
            </div>
          </div>

          {/* Future Sales Opportunities (Next Revenue) */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <span>향후 추가 영업 기회 (Upsell / Expansion Opportunities)</span>
            </div>
            <p className="text-xs text-blue-900 leading-relaxed whitespace-pre-line">
              {summary.futureSalesOpportunities}
            </p>
          </div>

          {/* Lessons Learned (회고) */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-5 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <BookOpen className="h-4 w-4 text-amber-700" />
              <span>프로젝트 회고 및 개선점 (Lessons Learned)</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed whitespace-pre-line">
              {summary.lessonsLearned}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
