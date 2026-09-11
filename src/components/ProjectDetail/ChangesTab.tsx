import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  ArrowRight,
  Calendar,
  Layers,
  Sparkles,
  Filter,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface ChangesTabProps {
  projectId: string;
}

export const ChangesTab: React.FC<ChangesTabProps> = ({ projectId }) => {
  const { consultations } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('전체');

  // Collect all changes from consultations of this project
  const projectConsultations = consultations
    .filter((c) => c.projectId === projectId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const allChanges = projectConsultations.flatMap((c) =>
    (c.changes || []).map((ch, idx) => ({
      id: `${c.id}-ch-${idx}`,
      consultationId: c.id,
      consultationSummary: c.summary,
      date: c.date,
      method: c.method,
      item: ch.item,
      before: ch.before,
      after: ch.after,
      reason: ch.reason,
    }))
  );

  const categories = ['전체', '수량', '사양/소재', '모델', '납기', '예산/가격'];

  const filteredChanges = allChanges.filter((ch) => {
    if (filterCategory === '전체') return true;
    const lowerItem = ch.item.toLowerCase();
    if (filterCategory === '수량' && (lowerItem.includes('수량') || lowerItem.includes('ea') || lowerItem.includes('개'))) return true;
    if (filterCategory === '사양/소재' && (lowerItem.includes('컬러') || lowerItem.includes('원단') || lowerItem.includes('상판') || lowerItem.includes('패브릭') || lowerItem.includes('마감'))) return true;
    if (filterCategory === '모델' && (lowerItem.includes('모델') || lowerItem.includes('라인업') || lowerItem.includes('체어') || lowerItem.includes('테이블'))) return true;
    if (filterCategory === '납기' && (lowerItem.includes('납품') || lowerItem.includes('일정') || lowerItem.includes('납기'))) return true;
    if (filterCategory === '예산/가격' && (lowerItem.includes('금액') || lowerItem.includes('가격') || lowerItem.includes('예산') || lowerItem.includes('단가'))) return true;
    return lowerItem.includes(filterCategory);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">프로젝트 주요 변경사항 (Changes Before → After)</h2>
          <p className="text-xs text-neutral-500">
            상담 및 협의를 거치며 변경된 품목·수량·사양·납기 등을 한눈에 추적합니다. (총 {allChanges.length}건)
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <span className="text-neutral-400 mr-1 text-[11px] flex items-center gap-1">
            <Filter className="h-3 w-3" />
            분류:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-2.5 py-1 text-xs whitespace-nowrap transition-colors ${
                filterCategory === cat
                  ? 'bg-neutral-900 text-white font-medium shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredChanges.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400 bg-white rounded-xl border border-neutral-200">
          <TrendingUp className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
          <p className="font-medium text-neutral-600">누적된 변경사항이 없습니다.</p>
          <p className="text-neutral-400 mt-1">상담 녹취에서 AI가 사양 및 수량 변경을 감지하면 이곳에 기록됩니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChanges.map((change) => (
            <div
              key={change.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs space-y-3 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                  {change.item}
                </span>
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(change.date)}
                </span>
              </div>

              {/* Before -> After visual comparison */}
              <div className="grid grid-cols-11 items-center gap-2 rounded-lg bg-neutral-50 p-3 border border-neutral-100 text-xs">
                <div className="col-span-5">
                  <span className="text-[10px] text-neutral-400 block mb-0.5 uppercase">이전 (Before)</span>
                  <div className="line-through text-neutral-500 font-medium break-words">
                    {change.before}
                  </div>
                </div>

                <div className="col-span-1 flex justify-center text-neutral-400">
                  <ArrowRight className="h-4 w-4" />
                </div>

                <div className="col-span-5">
                  <span className="text-[10px] text-emerald-600 block mb-0.5 uppercase font-semibold">
                    변경 후 (After)
                  </span>
                  <div className="font-bold text-neutral-900 break-words">
                    {change.after}
                  </div>
                </div>
              </div>

              {/* Context / Reason */}
              <div className="text-[11px] text-neutral-600 space-y-1">
                {change.reason && (
                  <p>
                    <span className="font-semibold text-neutral-800">변경 사유: </span>
                    {change.reason}
                  </p>
                )}
                <p className="text-neutral-400 text-[10px] truncate">
                  출처: {change.method} ({change.consultationSummary})
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
