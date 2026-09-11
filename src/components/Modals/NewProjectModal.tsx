import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Building2, Sparkles, X } from 'lucide-react';

interface NewProjectModalProps {
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose }) => {
  const { clients, createProjectWithMinimalInput, setActiveProjectId, setCurrentView } =
    useApp();

  const [companyName, setCompanyName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Optional fields
  const [siteName, setSiteName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [budget, setBudget] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !projectName.trim()) return;

    const tags = tagsInput
      ? tagsInput
          .split(',')
          .map((t) => t.trim().replace(/^#/, ''))
          .filter(Boolean)
      : ['신규상담'];

    const newProject = createProjectWithMinimalInput({
      clientName: companyName.trim(),
      projectName: projectName.trim(),
      siteName: siteName.trim() || undefined,
      siteAddress: siteAddress.trim() || undefined,
      budget: budget.trim() || undefined,
      tags,
    });

    setActiveProjectId(newProject.id);
    setCurrentView('project-detail');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-neutral-200 overflow-hidden my-6">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-neutral-50/70">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">신규 가구 프로젝트 생성</h2>
            <p className="text-xs text-neutral-500">
              최소 입력 원칙: 회사명과 프로젝트명만 입력하면 즉시 생성됩니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* AI Guidance Note */}
          <div className="rounded-lg bg-blue-50/70 border border-blue-200 p-3 flex items-start gap-2.5 text-blue-900">
            <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>최소 입력 안내:</strong> 납품 예정일, 수량, 사양, 견적 금액 등 복잡한 정보는
              이후 <strong>상담 녹음이나 견적서 업로드</strong> 시 AI가 자동으로 분석하여
              구조화해 드립니다.
            </p>
          </div>

          {/* Core required fields: Company Name + Project Name */}
          <div>
            <label className="font-bold text-neutral-900 block mb-1">
              고객사 (회사명) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                placeholder="예: (주)네오엔터프라이즈"
                list="client-suggestions"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
              <datalist id="client-suggestions">
                {clients.map((c) => (
                  <option key={c.id} value={c.companyName} />
                ))}
              </datalist>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              기존 등록된 고객사를 선택하거나 새 회사명을 직접 입력하세요.
            </span>
          </div>

          <div>
            <label className="font-bold text-neutral-900 block mb-1">
              프로젝트명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 판교 신사옥 3층 라운지 & 임원실 가구 납품"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          {/* Advanced toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-neutral-500 hover:text-neutral-900 underline underline-offset-2 text-[11px]"
            >
              {showAdvanced ? '추가 정보 닫기' : '+ 현장명 / 예산 / 태그 추가 입력 (선택)'}
            </button>
          </div>

          {showAdvanced && (
            <div className="space-y-3 pt-2 border-t border-neutral-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-neutral-700 block mb-1">현장명 (선택)</label>
                  <input
                    type="text"
                    placeholder="예: 판교 제2테크노밸리 사옥 3층"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full rounded border border-neutral-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-700 block mb-1">예산 (선택)</label>
                  <input
                    type="text"
                    placeholder="예: 약 2,000만원"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full rounded border border-neutral-300 px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">현장 주소 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 경기 성남시 분당구 판교역로 100"
                  value={siteAddress}
                  onChange={(e) => setSiteAddress(e.target.value)}
                  className="w-full rounded border border-neutral-300 px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  placeholder="예: 신사옥, 라운지, 임원실, 우드"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full rounded border border-neutral-300 px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-300 px-3.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-md bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 shadow-xs"
            >
              프로젝트 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
