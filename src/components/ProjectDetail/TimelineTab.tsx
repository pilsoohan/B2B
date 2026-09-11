import React, { useState } from 'react';
import { TimelineItem } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  FileCheck,
  TrendingUp,
  CheckCircle2,
  Truck,
  FileText,
  Wrench,
  ChevronRight,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface TimelineTabProps {
  projectId: string;
  onSelectItemDetail?: (item: TimelineItem) => void;
}

export const TimelineTab: React.FC<TimelineTabProps> = ({
  projectId,
  onSelectItemDetail,
}) => {
  const { timeline, consultations, quotes, files } = useApp();
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<TimelineItem | null>(null);

  // Filter timeline for this project, sorted descending by date
  const projectTimeline = timeline
    .filter((t) => t.projectId === projectId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTimelineIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'consultation':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'quote':
        return <FileCheck className="h-4 w-4 text-emerald-600" />;
      case 'change':
        return <TrendingUp className="h-4 w-4 text-amber-600" />;
      case 'order':
        return <CheckCircle2 className="h-4 w-4 text-purple-600" />;
      case 'delivery':
        return <Truck className="h-4 w-4 text-teal-600" />;
      case 'file':
        return <FileText className="h-4 w-4 text-neutral-600" />;
      case 'task':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'as':
        return <Wrench className="h-4 w-4 text-orange-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-neutral-500" />;
    }
  };

  const getTimelineBadgeClass = (type: TimelineItem['type']) => {
    switch (type) {
      case 'consultation':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'quote':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      case 'change':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
      case 'order':
        return 'bg-purple-50 text-purple-700 border-purple-200 font-bold';
      case 'delivery':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'file':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
      case 'task':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'as':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const handleItemClick = (item: TimelineItem) => {
    setSelectedTimelineItem(item);
    if (onSelectItemDetail) {
      onSelectItemDetail(item);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-100 pb-3">
        <h2 className="text-sm font-bold text-neutral-900">프로젝트 타임라인 (Timeline)</h2>
        <p className="text-xs text-neutral-500">
          첫 상담부터 견적 변경, 발주, 납품까지 모든 히스토리를 시간순으로 누적 관리합니다.
        </p>
      </div>

      {projectTimeline.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400 bg-white rounded-xl border border-neutral-200">
          아직 등록된 타임라인 기록이 없습니다. 새 상담 또는 견적서를 등록해보세요.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
          {projectTimeline.map((item) => {
            const isSelected = selectedTimelineItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`relative group cursor-pointer transition-all rounded-xl border p-4 bg-white shadow-2xs hover:shadow-xs ${
                  isSelected
                    ? 'border-neutral-900 ring-1 ring-neutral-900'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Timeline node circle */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-4 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-neutral-300 shadow-2xs group-hover:scale-110 transition-transform">
                  {getTimelineIcon(item.type)}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900 group-hover:text-neutral-950">
                      {item.title}
                    </span>
                    {item.badge && (
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] border ${getTimelineBadgeClass(
                          item.type
                        )}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.date)}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {item.description}
                </p>

                {/* Additional reference link hint */}
                {item.refId && (
                  <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                    <span className="flex items-center gap-1 text-neutral-600 font-medium group-hover:underline">
                      <ExternalLink className="h-3 w-3 text-neutral-400" />
                      연계 상세 보기 (
                      {item.refType === 'consultation'
                        ? '상담일지'
                        : item.refType === 'quote'
                        ? '견적서'
                        : '관련 첨부'}
                      )
                    </span>
                    <ChevronRight className="h-3 w-3 text-neutral-400 group-hover:text-neutral-700" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Item Detail Drawer/Modal Preview */}
      {selectedTimelineItem && (
        <TimelineDetailModal
          item={selectedTimelineItem}
          consultations={consultations}
          quotes={quotes}
          files={files}
          onClose={() => setSelectedTimelineItem(null)}
        />
      )}
    </div>
  );
};

interface TimelineDetailModalProps {
  item: TimelineItem;
  consultations: any[];
  quotes: any[];
  files: any[];
  onClose: () => void;
}

const TimelineDetailModal: React.FC<TimelineDetailModalProps> = ({
  item,
  consultations,
  quotes,
  files,
  onClose,
}) => {
  // Find associated record
  const consultRecord = consultations.find((c) => c.id === item.refId);
  const quoteRecord = quotes.find((q) => q.id === item.refId);
  const fileRecord = files.find((f) => f.id === item.refId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl border border-neutral-200 max-h-[85vh] overflow-y-auto space-y-4">
        <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
              타임라인 상세 기록 · {formatDate(item.date)}
            </span>
            <h3 className="text-base font-bold text-neutral-900">{item.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-neutral-400 hover:text-neutral-800"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded border border-neutral-100">
          {item.description}
        </p>

        {/* If consultation record found */}
        {consultRecord && (
          <div className="space-y-3 pt-2 text-xs">
            <h4 className="font-semibold text-neutral-900">원본 상담일지 요약</h4>
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-2">
              <div>
                <span className="text-[11px] text-blue-700 font-medium block">상담 방식</span>
                <span className="text-neutral-800">{consultRecord.method}</span>
              </div>
              <div>
                <span className="text-[11px] text-blue-700 font-medium block">상담 요약</span>
                <p className="text-neutral-800">{consultRecord.summary}</p>
              </div>
              {consultRecord.changes?.length > 0 && (
                <div>
                  <span className="text-[11px] text-blue-700 font-medium block">추출된 변경사항</span>
                  <div className="space-y-1 mt-1">
                    {consultRecord.changes.map((ch: any, idx: number) => (
                      <div key={idx} className="bg-white p-1.5 rounded border border-blue-200">
                        <strong>{ch.item}:</strong> {ch.before} → <strong>{ch.after}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* If quote record found */}
        {quoteRecord && (
          <div className="space-y-3 pt-2 text-xs">
            <h4 className="font-semibold text-neutral-900">견적 내역 ({quoteRecord.version})</h4>
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-2">
              <div className="flex justify-between font-bold text-neutral-900">
                <span>총 견적금액:</span>
                <span>{quoteRecord.totalAmount?.toLocaleString()}원 (VAT 별도)</span>
              </div>
              <p className="text-neutral-700 text-[11px]">{quoteRecord.changeNotes}</p>
            </div>
          </div>
        )}

        {/* If file record found */}
        {fileRecord && (
          <div className="space-y-2 pt-2 text-xs">
            <h4 className="font-semibold text-neutral-900">첨부 파일 정보</h4>
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-between">
              <div>
                <div className="font-medium text-neutral-900">{fileRecord.name}</div>
                <div className="text-[11px] text-neutral-500">
                  {fileRecord.type} · {fileRecord.fileSize}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-neutral-100">
          <button
            onClick={onClose}
            className="rounded-md bg-neutral-900 px-4 py-1.5 text-xs text-white hover:bg-neutral-800"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
