import React, { useState } from 'react';
import { Project, Quote, QuoteItem } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  FileCheck,
  Plus,
  Trash2,
  Upload,
  Calendar,
  DollarSign,
  X,
} from 'lucide-react';
import { formatKRW } from '../../utils/formatters';

interface NewQuoteModalProps {
  initialProjectId?: string;
  onClose: () => void;
}

export const NewQuoteModal: React.FC<NewQuoteModalProps> = ({
  initialProjectId,
  onClose,
}) => {
  const { projects, quotes, addQuote } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || projects[0]?.id || ''
  );
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Count existing quotes to suggest version
  const existingQuotes = quotes.filter((q) => q.projectId === selectedProjectId);
  const nextVersionNum = existingQuotes.length + 1;
  const defaultVersion = `${nextVersionNum}차 견적`;

  const [version, setVersion] = useState(defaultVersion);
  const [changeNotes, setChangeNotes] = useState('');
  const [updateProjectQuote, setUpdateProjectQuote] = useState(true);

  // Line items
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: `item-1`,
      productName: '오피스 데스크 W1600',
      option: '오크 상판 / 화이트 프레임',
      specification: 'W1600 * D800 * H720',
      quantity: 10,
      unitPrice: 450000,
      discountRate: 0,
      totalPrice: 4500000,
      leadTime: '발주 후 2주',
    },
    {
      id: `item-2`,
      productName: '태스크 메쉬 체어',
      option: '블랙 메쉬 / 헤드레스트 유',
      specification: 'W640 * D600 * H1150',
      quantity: 10,
      unitPrice: 320000,
      discountRate: 0,
      totalPrice: 3200000,
      leadTime: '발주 후 2주',
    },
  ]);

  const totalAmount = items.reduce((sum, it) => sum + (it.totalPrice || 0), 0);

  const handleAddItem = () => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}`,
      productName: '신규 품목',
      option: '기본 사양',
      quantity: 1,
      unitPrice: 100000,
      totalPrice: 100000,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (idx: number, field: keyof QuoteItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[idx], [field]: value };

    // Auto-recalculate totalPrice if quantity or unitPrice changes
    if (field === 'quantity' || field === 'unitPrice' || field === 'discountRate') {
      const q = Number(current.quantity) || 0;
      const u = Number(current.unitPrice) || 0;
      const d = Number(current.discountRate) || 0;
      const raw = q * u;
      current.totalPrice = Math.round(raw * (1 - d / 100));
    }

    updated[idx] = current;
    setItems(updated);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    const todayStr = new Date().toISOString().split('T')[0];

    addQuote(
      {
        projectId: selectedProject.id,
        version,
        totalAmount,
        changeNotes: changeNotes.trim() || undefined,
        items,
        createdAt: todayStr,
      },
      updateProjectQuote
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-neutral-200 overflow-hidden my-6">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-white shadow-xs">
              <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900">새 견적서 등록</h2>
              <p className="text-xs text-neutral-500">
                버전별 견적서 품목을 구성하거나 변동 사유를 기록합니다.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Top Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">대상 프로젝트</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.clientName}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">견적 버전 명칭</label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="예: 2차 수정 견적, 최종 견적"
                className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              변경 사유 및 견적 비고
            </label>
            <textarea
              rows={2}
              placeholder="예: 클라이언트 요청으로 체어 수량 4개 추가 및 소파 패브릭 Kvadrat 업그레이드 반영"
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900">견적 세부 품목 ({items.length}개)</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 rounded border border-neutral-300 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <Plus className="h-3 w-3" />
                품목 추가
              </button>
            </div>

            <div className="overflow-x-auto border border-neutral-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-[11px] font-medium text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="py-2 px-3">품목명 / 옵션</th>
                    <th className="py-2 px-2 w-20 text-right">수량</th>
                    <th className="py-2 px-2 w-28 text-right">단가 (원)</th>
                    <th className="py-2 px-2 w-28 text-right">공급가액</th>
                    <th className="py-2 px-2 w-10 text-center">삭제</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {items.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-neutral-50/50">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={it.productName}
                          onChange={(e) => handleUpdateItem(idx, 'productName', e.target.value)}
                          placeholder="품목명"
                          className="w-full rounded border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-900 mb-1"
                        />
                        <input
                          type="text"
                          value={it.option || ''}
                          onChange={(e) => handleUpdateItem(idx, 'option', e.target.value)}
                          placeholder="규격 / 옵션 / 소재"
                          className="w-full rounded border border-neutral-200 px-2 py-0.5 text-[11px] text-neutral-600"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={it.quantity}
                          min={1}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full rounded border border-neutral-200 px-2 py-1 text-xs text-right font-medium"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          value={it.unitPrice}
                          step={10000}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full rounded border border-neutral-200 px-2 py-1 text-xs text-right"
                        />
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-neutral-900">
                        {it.totalPrice?.toLocaleString()}원
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-neutral-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total calculation & option */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={updateProjectQuote}
                onChange={(e) => setUpdateProjectQuote(e.target.checked)}
                className="rounded text-neutral-900 focus:ring-neutral-900"
              />
              <span className="text-xs text-neutral-700 font-medium">
                프로젝트의 최신 견적 금액({formatKRW(totalAmount)})으로 자동 갱신
              </span>
            </label>

            <div className="text-right">
              <span className="text-[11px] text-neutral-400 block">총 공급가액 (VAT 별도)</span>
              <span className="text-base font-bold text-neutral-900">{formatKRW(totalAmount)}</span>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-300 px-3.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
            >
              취소
            </button>

            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 shadow-xs"
            >
              견적서 등록 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
