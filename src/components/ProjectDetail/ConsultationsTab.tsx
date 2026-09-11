import React, { useState } from 'react';
import { ConsultationLog } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Plus,
  Mic,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface ConsultationsTabProps {
  projectId: string;
  onOpenNewConsultation: () => void;
}

export const ConsultationsTab: React.FC<ConsultationsTabProps> = ({
  projectId,
  onOpenNewConsultation,
}) => {
  const { consultations } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const projectConsultations = consultations
    .filter((c) => c.projectId === projectId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">상담 및 커뮤니케이션 기록 (Consultations)</h2>
          <p className="text-xs text-neutral-500">
            음성 녹음 또는 텍스트 입력으로 AI가 자동 구조화한 상담일지 목록입니다. (총 {projectConsultations.length}건)
          </p>
        </div>
        <button
          onClick={onOpenNewConsultation}
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors"
        >
          <Mic className="h-3.5 w-3.5" />
          새 상담 녹음 / 입력
        </button>
      </div>

      {projectConsultations.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400 bg-white rounded-xl border border-dashed border-neutral-300">
          <MessageSquare className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
          <p className="font-medium text-neutral-600">등록된 상담 기록이 없습니다.</p>
          <p className="text-neutral-400 mt-1">상담 녹취 또는 대화 내용을 입력하여 AI 분석을 시작하세요.</p>
          <button
            onClick={onOpenNewConsultation}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            첫 상담일지 생성
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projectConsultations.map((log) => {
            const isExpanded = expandedId === log.id || projectConsultations.length === 1;

            return (
              <div
                key={log.id}
                className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-4 transition-all"
              >
                {/* Top header of consultation card */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="rounded bg-neutral-900 text-white px-2 py-0.5 text-[11px] font-semibold">
                      {log.method}
                    </span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(log.date)}
                    </span>
                    {log.attendees && log.attendees.length > 0 && (
                      <>
                        <span className="text-xs text-neutral-400">·</span>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.attendees.join(', ')}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {log.changes && log.changes.length > 0 && (
                      <span className="rounded bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-medium">
                        변경 {log.changes.length}건
                      </span>
                    )}
                    {log.unconfirmedItems && log.unconfirmedItems.length > 0 && (
                      <span className="rounded bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 text-[10px] font-medium">
                        확인 필요 {log.unconfirmedItems.length}건
                      </span>
                    )}
                    <button className="text-neutral-400 hover:text-neutral-700">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Summary (always visible) */}
                <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-800 leading-relaxed border border-neutral-100">
                  <div className="text-[11px] font-semibold text-neutral-500 mb-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    AI 핵심 요약
                  </div>
                  <p className="whitespace-pre-line">{log.summary}</p>
                </div>

                {/* Expanded Sections */}
                {isExpanded && (
                  <div className="space-y-4 pt-2 border-t border-neutral-100 text-xs">
                    {/* 1. New Requests */}
                    {log.newRequests && log.newRequests.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                          신규 요청사항
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-neutral-700 bg-blue-50/40 p-2.5 rounded border border-blue-100">
                          {log.newRequests.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 2. Changes (Before -> After) */}
                    {log.changes && log.changes.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
                          협의 변경사항 (Before → After)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {log.changes.map((ch, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5 text-xs space-y-1"
                            >
                              <span className="font-semibold text-amber-900">{ch.item}</span>
                              <div className="flex items-center gap-2 text-neutral-700">
                                <span className="line-through text-neutral-400">{ch.before}</span>
                                <span className="text-neutral-400">→</span>
                                <span className="font-bold text-neutral-900">{ch.after}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Confirmed items vs Unconfirmed (Need verification) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Confirmed */}
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 space-y-2">
                        <h4 className="font-semibold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          확정사항 (제품·수량·가격·납기)
                        </h4>
                        {log.confirmedItems && log.confirmedItems.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1 text-neutral-800">
                            {log.confirmedItems.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-neutral-400 italic">확정된 항목 없음</p>
                        )}
                      </div>

                      {/* Unconfirmed / Needs check */}
                      <div className="rounded-lg border border-red-200 bg-red-50/40 p-3 space-y-2">
                        <h4 className="font-semibold text-red-900 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                          미확정 / 확인 필요 사항
                        </h4>
                        {log.unconfirmedItems && log.unconfirmedItems.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1 text-red-900 font-medium">
                            {log.unconfirmedItems.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-neutral-400 italic">미확정 사항 없음</p>
                        )}
                      </div>
                    </div>

                    {/* 4. Follow-up Tasks */}
                    {log.followUpTasks && log.followUpTasks.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-neutral-600" />
                          후속 연계 업무
                        </h4>
                        <div className="space-y-1.5">
                          {log.followUpTasks.map((t, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-neutral-50 p-2 rounded border border-neutral-100"
                            >
                              <span className="font-medium text-neutral-800">{t.task}</span>
                              <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                                <span>담당: {t.assignee || '본인'}</span>
                                <span>·</span>
                                <span>기한: {formatDate(t.dueDate)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. Audio Transcript or Raw Text Toggle */}
                    {(log.rawContent || log.audioTranscript) && (
                      <details className="mt-2 text-xs text-neutral-500 group">
                        <summary className="cursor-pointer font-medium hover:text-neutral-900 py-1 flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          상담 원본 텍스트 / 녹취록 전문 보기
                        </summary>
                        <div className="mt-2 p-3 bg-neutral-50 rounded border border-neutral-200 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-neutral-700 max-h-60 overflow-y-auto">
                          {log.audioTranscript || log.rawContent}
                        </div>
                      </details>
                    )}
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
