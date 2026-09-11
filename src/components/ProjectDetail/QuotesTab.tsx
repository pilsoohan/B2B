import React, { useState } from 'react';
import { Quote } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  FileCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatKRW, formatDate } from '../../utils/formatters';

interface QuotesTabProps {
  projectId: string;
  onOpenNewQuote: () => void;
  onOpenQuoteCompare: (prevQuote: Quote, nextQuote: Quote) => void;
}

export const QuotesTab: React.FC<QuotesTabProps> = ({
  projectId,
  onOpenNewQuote,
  onOpenQuoteCompare,
}) => {
  const { quotes } = useApp();
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);

  // Quotes for this project, sorted by createdAt ascending (to see progression)
  const projectQuotes = quotes
    .filter((q) => q.projectId === projectId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const toggleExpand = (id: string) => {
    setExpandedQuoteId(expandedQuoteId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">견적서 이력 및 버전 관리 (Quotes)</h2>
          <p className="text-xs text-neutral-500">
            버전별 견적서(1차, 2차, 최종 등)를 관리하고 버전 간 품목·수량·금액 변동을 AI로 비교합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {projectQuotes.length >= 2 && (
            <button
              onClick={() => {
                const prev = projectQuotes[projectQuotes.length - 2];
                const next = projectQuotes[projectQuotes.length - 1];
                onOpenQuoteCompare(prev, next);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-2xs hover:bg-neutral-50 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              최신 버전 간 비교
            </button>
          )}
          <button
            onClick={onOpenNewQuote}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            새 견적서 등록
          </button>
        </div>
      </div>

      {projectQuotes.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400 bg-white rounded-xl border border-dashed border-neutral-300">
          <FileCheck className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
          <p className="font-medium text-neutral-600">등록된 견적서가 없습니다.</p>
          <p className="text-neutral-400 mt-1">1차 견적서를 등록하거나 엑셀 파일을 업로드하세요.</p>
          <button
            onClick={onOpenNewQuote}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            1차 견적서 등록
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projectQuotes.map((quote, index) => {
            const isExpanded = expandedQuoteId === quote.id || projectQuotes.length === 1;
            const prevQuote = index > 0 ? projectQuotes[index - 1] : null;
            const diffAmount = prevQuote ? quote.totalAmount - prevQuote.totalAmount : 0;

            return (
              <div
                key={quote.id}
                className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4"
              >
                {/* Top card summary */}
                <div
                  onClick={() => toggleExpand(quote.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white">
                      {quote.version}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-neutral-900">
                        {formatKRW(quote.totalAmount)}
                        <span className="ml-1 text-[11px] font-normal text-neutral-500">(VAT 별도)</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(quote.createdAt)}</span>
                        {quote.items && (
                          <>
                            <span>·</span>
                            <span>품목 {quote.items.length}개</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Diff indicator vs previous version */}
                    {prevQuote && (
                      <div className="text-right">
                        <div
                          className={`text-xs font-bold flex items-center gap-1 ${
                            diffAmount > 0
                              ? 'text-amber-700'
                              : diffAmount < 0
                              ? 'text-blue-700'
                              : 'text-neutral-500'
                          }`}
                        >
                          {diffAmount > 0 ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : diffAmount < 0 ? (
                            <TrendingDown className="h-3.5 w-3.5" />
                          ) : null}
                          {diffAmount > 0 ? `+${diffAmount.toLocaleString()}원` : `${diffAmount.toLocaleString()}원`}
                        </div>
                        <span className="text-[10px] text-neutral-400">
                          {prevQuote.version} 대비
                        </span>
                      </div>
                    )}

                    {/* Version compare button */}
                    {prevQuote && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenQuoteCompare(prevQuote, quote);
                        }}
                        className="rounded bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-700 transition-colors"
                      >
                        이전 버전과 AI 비교
                      </button>
                    )}

                    <button className="text-neutral-400 hover:text-neutral-700">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Change notes if any */}
                {quote.changeNotes && (
                  <div className="rounded-lg bg-neutral-50 p-2.5 text-xs text-neutral-700 border border-neutral-100">
                    <span className="font-semibold text-neutral-900 mr-1.5">변경 사유 및 특이사항:</span>
                    {quote.changeNotes}
                  </div>
                )}

                {/* Items breakdown table */}
                {isExpanded && quote.items && quote.items.length > 0 && (
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-500">
                        <tr>
                          <th className="py-2 px-3">품목명 / 사양</th>
                          <th className="py-2 px-2 text-right">수량</th>
                          <th className="py-2 px-2 text-right">단가</th>
                          <th className="py-2 px-2 text-right">공급가액</th>
                          <th className="py-2 px-2">납기 / 비고</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {quote.items.map((item) => (
                          <tr key={item.id} className="hover:bg-neutral-50/50">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-neutral-900">{item.productName}</div>
                              {(item.option || item.specification) && (
                                <div className="text-[11px] text-neutral-500 mt-0.5">
                                  {item.option} {item.specification && `(${item.specification})`}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-right font-medium text-neutral-800">
                              {item.quantity} EA
                            </td>
                            <td className="py-2.5 px-2 text-right text-neutral-700">
                              {item.unitPrice.toLocaleString()}원
                            </td>
                            <td className="py-2.5 px-2 text-right font-bold text-neutral-900">
                              {item.totalPrice.toLocaleString()}원
                            </td>
                            <td className="py-2.5 px-2 text-neutral-500 text-[11px]">
                              {item.leadTime || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
