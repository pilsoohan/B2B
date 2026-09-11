import React, { useState } from 'react';
import { AfterServiceRecord } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Wrench,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface AfterServiceTabProps {
  projectId: string;
}

export const AfterServiceTab: React.FC<AfterServiceTabProps> = ({ projectId }) => {
  const { afterServices, addAfterService } = useApp();
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [title, setTitle] = useState('');
  const [issue, setIssue] = useState('');
  const [action, setAction] = useState('');
  const [status, setStatus] = useState<AfterServiceRecord['status']>('접수');

  const projectRecords = afterServices.filter((r) => r.projectId === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !issue.trim()) return;

    addAfterService({
      projectId,
      date,
      title: title.trim(),
      issue: issue.trim(),
      action: action.trim() || '조치 계획 수립 중',
      status,
    });

    setTitle('');
    setIssue('');
    setAction('');
    setIsAdding(false);
  };

  const getStatusBadge = (s: AfterServiceRecord['status']) => {
    switch (s) {
      case '완료':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '처리 중':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '접수':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">납품 후 A/S 및 추가 요청 (After Service)</h2>
          <p className="text-xs text-neutral-500">
            납품 완료 후 발생하는 하자 접수, 부품 교체, 추가 발주 건을 기록하고 조치 결과를 추적합니다.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          {isAdding ? '작성 닫기' : '새 A/S 요청 등록'}
        </button>
      </div>

      {/* New A/S Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-neutral-300 bg-neutral-50/70 p-4 space-y-3"
        >
          <div className="text-xs font-semibold text-neutral-800">A/S 및 사후 요청 접수</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">접수일자</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-neutral-500 block mb-1">제목</label>
              <input
                type="text"
                required
                placeholder="예: 3층 회의실 체어 암레스트 유격 발생"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">문제 / 요청 내용</label>
              <textarea
                rows={2}
                required
                placeholder="발생한 하자 현상이나 클라이언트의 추가 요청 사항"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">조치 내용 / 계획</label>
              <textarea
                rows={2}
                placeholder="방문 예정일, 부품 교체 여부 등 조치 내용"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs text-neutral-800 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-500">진행 상태:</span>
              {(['접수', '처리 중', '완료'] as const).map((s) => (
                <label key={s} className="inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="as_status"
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-200"
              >
                취소
              </button>
              <button
                type="submit"
                className="rounded bg-neutral-900 px-3.5 py-1 text-xs font-medium text-white hover:bg-neutral-800"
              >
                저장
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Record List */}
      {projectRecords.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400 bg-white rounded-xl border border-neutral-200">
          <Wrench className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
          <p className="font-medium text-neutral-600">등록된 A/S 및 추가 요청이 없습니다.</p>
          <p className="text-neutral-400 mt-1">납품 후 부품 교체나 하자 발생 시 기록하세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projectRecords.map((rec) => (
            <div
              key={rec.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs space-y-2 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-orange-600" />
                  <span className="font-bold text-xs text-neutral-900">{rec.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] border font-medium ${getStatusBadge(
                      rec.status
                    )}`}
                  >
                    {rec.status}
                  </span>
                  <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(rec.date)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-neutral-50 p-2.5 rounded border border-neutral-100">
                  <span className="text-[11px] text-neutral-400 font-medium block mb-0.5">
                    문제 및 접수 내용
                  </span>
                  <p className="text-neutral-800">{rec.issue}</p>
                </div>

                <div className="bg-emerald-50/50 p-2.5 rounded border border-emerald-100">
                  <span className="text-[11px] text-emerald-700 font-medium block mb-0.5">
                    조치 및 해결 내역
                  </span>
                  <p className="text-neutral-800">{rec.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
