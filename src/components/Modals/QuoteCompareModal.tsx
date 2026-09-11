import React, { useState, useEffect } from 'react';
import { Quote, QuoteDiffSummary } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Clock,
  Layers,
  Calendar,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { formatKRW, formatDate } from '../../utils/formatters';

interface QuoteCompareModalProps {
  prevQuote: Quote;
  nextQuote: Quote;
  onClose: () => void;
}

export const QuoteCompareModal: React.FC<QuoteCompareModalProps> = ({
  prevQuote,
  nextQuote,
  onClose,
}) => {
  const { quotes } = useApp();
  const [selectedPrevId, setSelectedPrevId] = useState(prevQuote.id);
  const [selectedNextId, setSelectedNextId] = useState(nextQuote.id);
  const [loading, setLoading] = useState(false);
  const [diffResult, setDiffResult] = useState<QuoteDiffSummary | null>(null);

  const currentPrev = quotes.find((q) => q.id === selectedPrevId) || prevQuote;
  const currentNext = quotes.find((q) => q.id === selectedNextId) || nextQuote;

  const handleRunComparison = async (prev: Quote, next: Quote) => {
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/compare-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prevQuote: prev,
          nextQuote: next,
        }),
      });

      if (!res.ok) {
        throw new Error('Comparison API error');
      }

      const diff: QuoteDiffSummary = await res.json();
      setDiffResult(diff);
    } catch (err) {
      console.error('Quote compare error:', err);
      // Fallback local diff calculation
      const amountDiff = next.totalAmount - prev.totalAmount;
      setDiffResult({
        prevVersion: prev.version,
        nextVersion: next.version,
        amountDifference: amountDiff,
        amountDiffText: `${amountDiff > 0 ? '+' : ''}${amountDiff.toLocaleString()}원`,
        reasonSummary: `${prev.version} 대비 총 ${next.totalAmount.toLocaleString()}원으로 변동되었습니다. (${next.changeNotes || '품목 및 수량 조정'})`,
        addedItems: next.items
          ? next.items
              .filter((ni) => !prev.items?.some((pi) => pi.productName === ni.productName))
              .map((ni) => `${ni.productName} (${ni.quantity} EA)`)
          : [],
        removedItems: prev.items
          ? prev.items
              .filter((pi) => !next.items?.some((ni) => ni.productName === pi.productName))
              .map((pi) => `${pi.productName} (${pi.quantity} EA)`)
          : [],
        quantityChanges: next.items
          ? next.items
              .filter((ni) => {
                const pi = prev.items?.find((p) => p.productName === ni.productName);
                return pi && pi.quantity !== ni.quantity;
              })
              .map((ni) => {
                const pi = prev.items?.find((p) => p.productName === ni.productName);
                return `${ni.productName}: ${pi?.quantity} EA → ${ni.quantity} EA`;
              })
          : [],
        priceChanges: next.items
          ? next.items
              .filter((ni) => {
                const pi = prev.items?.find((p) => p.productName === ni.productName);
                return pi && pi.unitPrice !== ni.unitPrice;
              })
              .map((ni) => {
                const pi = prev.items?.find((p) => p.productName === ni.productName);
                return `${ni.productName} 단가: ${pi?.unitPrice.toLocaleString()}원 → ${ni.unitPrice.toLocaleString()}원`;
              })
          : [],
        leadTimeChanges: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunComparison(currentPrev, currentNext);
  }, [selectedPrevId, selectedNextId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-neutral-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-xs">
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">AI 견적서 버전 비교 분석</h2>
              <p className="text-xs text-neutral-500">
                버전 간 품목 추가·삭제, 수량·단가 변경 및 총 금액 변동 요약
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Version Selector Bar */}
        <div className="px-6 py-3.5 bg-neutral-50/50 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 font-medium">기준 버전:</span>
              <span className="font-bold text-neutral-900 bg-white border border-neutral-200 px-2 py-0.5 rounded">
                {currentPrev.version} ({formatKRW(currentPrev.totalAmount)})
              </span>
            </div>

            <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />

            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 font-medium">비교 버전:</span>
              <span className="font-bold text-neutral-900 bg-white border border-neutral-200 px-2 py-0.5 rounded">
                {currentNext.version} ({formatKRW(currentNext.totalAmount)})
              </span>
            </div>
          </div>

          <button
            onClick={() => handleRunComparison(currentPrev, currentNext)}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            다시 분석
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-neutral-800" />
              <p className="font-medium text-neutral-700">
                두 견적서의 품목 라인업과 금액 변동 내역을 대조 중입니다...
              </p>
            </div>
          ) : diffResult ? (
            <div className="space-y-5">
              {/* Financial Diff Overview Card */}
              <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    총 공급가액 변동
                  </span>
                  <div
                    className={`text-sm font-bold flex items-center gap-1.5 ${
                      diffResult.amountDifference > 0
                        ? 'text-amber-700'
                        : diffResult.amountDifference < 0
                        ? 'text-blue-700'
                        : 'text-neutral-600'
                    }`}
                  >
                    {diffResult.amountDifference > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : diffResult.amountDifference < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : null}
                    <span>{diffResult.amountDiffText}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
                  <div className="rounded-lg bg-neutral-50 p-2.5">
                    <span className="text-[10px] text-neutral-400 block mb-0.5">
                      {currentPrev.version}
                    </span>
                    <span className="font-bold text-neutral-800">
                      {formatKRW(currentPrev.totalAmount)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-neutral-50 p-2.5">
                    <span className="text-[10px] text-neutral-400 block mb-0.5">
                      {currentNext.version}
                    </span>
                    <span className="font-bold text-neutral-900">
                      {formatKRW(currentNext.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Reason Summary */}
                <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-800 border border-neutral-100">
                  <span className="font-bold text-neutral-900 mr-1.5">AI 변동 사유 요약:</span>
                  {diffResult.reasonSummary}
                </div>
              </div>

              {/* 4 Quadrants: Added, Removed, Quantity Changed, Price Changed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Added Items (Green) */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                    <PlusCircle className="h-4 w-4 text-emerald-600" />
                    <span>추가된 품목 ({diffResult.addedItems.length})</span>
                  </div>
                  {diffResult.addedItems.length === 0 ? (
                    <p className="text-neutral-400 italic text-[11px]">새로 추가된 품목 없음</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-neutral-800">
                      {diffResult.addedItems.map((item, idx) => (
                        <li key={idx} className="font-medium text-emerald-900">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 2. Removed Items (Red) */}
                <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-red-950">
                    <MinusCircle className="h-4 w-4 text-red-600" />
                    <span>삭제/제외된 품목 ({diffResult.removedItems.length})</span>
                  </div>
                  {diffResult.removedItems.length === 0 ? (
                    <p className="text-neutral-400 italic text-[11px]">제외된 품목 없음</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-red-900">
                      {diffResult.removedItems.map((item, idx) => (
                        <li key={idx} className="line-through text-red-700">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 3. Quantity Changes */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <Layers className="h-4 w-4 text-amber-600" />
                    <span>수량 변동 ({diffResult.quantityChanges.length})</span>
                  </div>
                  {diffResult.quantityChanges.length === 0 ? (
                    <p className="text-neutral-400 italic text-[11px]">수량 변동 품목 없음</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-amber-950 font-medium">
                      {diffResult.quantityChanges.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 4. Price Changes */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-blue-950">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span>단가 / 사양 변동 ({diffResult.priceChanges.length})</span>
                  </div>
                  {diffResult.priceChanges.length === 0 ? (
                    <p className="text-neutral-400 italic text-[11px]">단가 변동 품목 없음</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-blue-950 font-medium">
                      {diffResult.priceChanges.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Lead time changes if any */}
              {diffResult.leadTimeChanges && diffResult.leadTimeChanges.length > 0 && (
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 space-y-1 text-xs">
                  <span className="font-bold text-neutral-800">납기 변동 사항:</span>
                  <ul className="list-disc list-inside text-neutral-700">
                    {diffResult.leadTimeChanges.map((lt, idx) => (
                      <li key={idx}>{lt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-neutral-200 bg-neutral-50/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 shadow-xs"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};
