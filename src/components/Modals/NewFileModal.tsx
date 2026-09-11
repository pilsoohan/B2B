import React, { useState } from 'react';
import { ProjectFile } from '../../types';
import { useApp } from '../../context/AppContext';
import { Upload, FileText, Sparkles, X } from 'lucide-react';

interface NewFileModalProps {
  initialProjectId?: string;
  onClose: () => void;
}

const FILE_TYPES: ProjectFile['type'][] = [
  '도면',
  '견적서',
  '제품 사양서',
  '현장 사진',
  '계약/발주서',
  '기타',
];

export const NewFileModal: React.FC<NewFileModalProps> = ({ initialProjectId, onClose }) => {
  const { projects, addFile } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || projects[0]?.id || ''
  );
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<ProjectFile['type']>('도면');
  const [fileSize, setFileSize] = useState('1.2 MB');
  const [notes, setNotes] = useState('');
  const [aiDetected, setAiDetected] = useState(false);

  // Auto classification helper based on filename
  const detectFileType = (name: string): ProjectFile['type'] => {
    const lower = name.toLowerCase();
    if (lower.endsWith('.dwg') || lower.endsWith('.dxf') || lower.includes('도면') || lower.includes('cad')) {
      return '도면';
    }
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv') || lower.includes('견적')) {
      return '견적서';
    }
    if (lower.endsWith('.jpg') || lower.endsWith('.png') || lower.endsWith('.jpeg') || lower.includes('현장') || lower.includes('사진') || lower.includes('실측')) {
      return '현장 사진';
    }
    if (lower.includes('계약') || lower.includes('발주')) {
      return '계약/발주서';
    }
    if (lower.includes('스펙') || lower.includes('사양') || lower.includes('spec')) {
      return '제품 사양서';
    }
    return '기타';
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      setFileSize(sizeStr);

      const detected = detectFileType(file.name);
      setFileType(detected);
      setAiDetected(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !selectedProject) return;

    addFile({
      projectId: selectedProject.id,
      name: fileName.trim(),
      type: fileType,
      fileSize,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-neutral-200 overflow-hidden my-6">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-neutral-50/70">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">프로젝트 파일 등록</h2>
            <p className="text-xs text-neutral-500">
              도면, 견적서, 제품 사양서, 현장 사진 업로드 및 AI 자동 분류
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

          {/* File input dropzone */}
          <div>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-xl p-5 cursor-pointer hover:bg-neutral-50 transition-colors">
              <Upload className="h-6 w-6 text-neutral-400 mb-2" />
              <span className="text-xs font-semibold text-neutral-700">
                파일 선택 또는 드래그 앤 드롭
              </span>
              <span className="text-[10px] text-neutral-400 mt-1">
                CAD 도면, 엑셀 견적서, 제품 사양 PDF, 실측 사진 등
              </span>
              <input
                type="file"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">파일명</label>
            <input
              type="text"
              required
              placeholder="예: 3층 라운지 가구 배치도 (최종수정).dwg"
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value);
                const detected = detectFileType(e.target.value);
                setFileType(detected);
              }}
              className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-neutral-700">파일 종류 분류</label>
              {aiDetected && (
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  파일명 기반 자동 분류됨
                </span>
              )}
            </div>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as ProjectFile['type'])}
              className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
            >
              {FILE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              파일 메모 / 설명 (선택)
            </label>
            <input
              type="text"
              placeholder="예: 3층 라운지 실측 도면 (전기 콘센트 위치 표기됨)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

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
              파일 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
