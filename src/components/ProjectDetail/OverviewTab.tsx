import React, { useState } from 'react';
import { Project, Client } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  FileText,
  Clock,
  Edit2,
  Check,
  X,
  Phone,
  Mail,
  User,
  Sparkles,
} from 'lucide-react';
import { formatKRW, formatDate } from '../../utils/formatters';

interface OverviewTabProps {
  project: Project;
  client?: Client;
  onOpenConsultation: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  project,
  client,
  onOpenConsultation,
}) => {
  const { updateProject } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState(project.name);
  const [siteName, setSiteName] = useState(project.siteName);
  const [siteAddress, setSiteAddress] = useState(project.siteAddress);
  const [deliveryDate, setDeliveryDate] = useState(project.deliveryDate);
  const [targetProducts, setTargetProducts] = useState(project.targetProducts);
  const [quantity, setQuantity] = useState(project.quantity);
  const [budget, setBudget] = useState(project.budget);
  const [specialNotes, setSpecialNotes] = useState(project.specialNotes);

  const handleSave = () => {
    updateProject(project.id, {
      name,
      siteName,
      siteAddress,
      deliveryDate,
      targetProducts,
      quantity: Number(quantity),
      budget,
      specialNotes,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(project.name);
    setSiteName(project.siteName);
    setSiteAddress(project.siteAddress);
    setDeliveryDate(project.deliveryDate);
    setTargetProducts(project.targetProducts);
    setQuantity(project.quantity);
    setBudget(project.budget);
    setSpecialNotes(project.specialNotes);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Information Header & Edit Toggle */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">프로젝트 기본정보 (Overview)</h2>
          <p className="text-xs text-neutral-500">
            상담 내용 분석 및 견적을 통해 지속적으로 최신 정보가 구조화됩니다.
          </p>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1 rounded-md border border-neutral-300 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
            >
              <X className="h-3 w-3" />
              취소
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1 rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-800"
            >
              <Check className="h-3 w-3" />
              저장
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs"
          >
            <Edit2 className="h-3 w-3" />
            정보 수정
          </button>
        )}
      </div>

      {/* Main Grid: Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Site & Product details */}
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            현장 및 납품 사양
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-medium text-neutral-400 block mb-0.5">프로젝트명</label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              ) : (
                <div className="font-semibold text-neutral-900">{project.name}</div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-medium text-neutral-400 block mb-0.5">현장명</label>
              {isEditing ? (
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              ) : (
                <div className="text-neutral-800">{project.siteName}</div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-medium text-neutral-400 block mb-0.5">현장 주소</label>
              {isEditing ? (
                <input
                  type="text"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  className="w-full rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              ) : (
                <div className="text-neutral-700 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                  <span>{project.siteAddress}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-medium text-neutral-400 block mb-0.5">관심 제품 및 사양</label>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={targetProducts}
                  onChange={(e) => setTargetProducts(e.target.value)}
                  className="w-full rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              ) : (
                <div className="text-neutral-800 font-medium bg-neutral-50 p-2.5 rounded border border-neutral-100">
                  {project.targetProducts}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-0.5">총 수량</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                ) : (
                  <div className="font-semibold text-neutral-900">{project.quantity} EA</div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-400 block mb-0.5">납품 예정일</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                ) : (
                  <div className="font-semibold text-neutral-900">{formatDate(project.deliveryDate)}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financials & Client Contacts */}
        <div className="space-y-4">
          {/* Budget & Quote Card */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              예산 및 견적 관리
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-neutral-400 block mb-0.5">클라이언트 희망 예산</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                  />
                ) : (
                  <div className="font-semibold text-neutral-800">{project.budget || '미정'}</div>
                )}
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-0.5">최신 견적 금액 (VAT 별도)</span>
                <div className="font-bold text-neutral-900 text-sm">
                  {formatKRW(project.latestQuoteAmount)}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-neutral-400 block mb-0.5">특이사항 및 주의점</label>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full rounded border border-neutral-300 px-2 py-1 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              ) : (
                <div className="text-neutral-700 bg-amber-50/50 p-2.5 rounded border border-amber-200/60 leading-relaxed">
                  {project.specialNotes || '등록된 특이사항이 없습니다.'}
                </div>
              )}
            </div>
          </div>

          {/* Client Contacts */}
          {client && (
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-neutral-500" />
                  클라이언트 담당자 ({client.companyName})
                </span>
              </div>

              <div className="space-y-2">
                {client.contacts.map((c) => (
                  <div key={c.id} className="rounded-lg bg-neutral-50 p-2.5 border border-neutral-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">
                        {c.name} <span className="text-[11px] font-normal text-neutral-500">({c.title})</span>
                      </span>
                      <span className="text-[11px] text-neutral-500">{c.department}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-600">
                      {c.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-neutral-400" />
                          {c.phone}
                        </span>
                      )}
                      {c.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-neutral-400" />
                          {c.email}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistance Promo Tip */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">AI 자동 구조화 안내:</strong> 사용자가 모든 정보를 수기로 입력할 필요가 없습니다.
            상담 음성 녹음, 텍스트 메모, 카카오톡/이메일 내용이나 견적서를 업로드하면 AI가 변경사항 및 일정을 추출하여 확인 후 자동 반영합니다.
          </div>
        </div>
        <button
          onClick={onOpenConsultation}
          className="rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 whitespace-nowrap shadow-xs"
        >
          새 상담 입력하기
        </button>
      </div>
    </div>
  );
};
