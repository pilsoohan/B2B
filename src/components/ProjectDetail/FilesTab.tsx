import React, { useState } from 'react';
import { ProjectFile } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Upload,
  Filter,
  Plus,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  Download,
  Calendar,
  Tag,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const FILE_CATEGORIES: (ProjectFile['type'] | '전체')[] = [
  '전체',
  '도면',
  '견적서',
  '제품 사양서',
  '현장 사진',
  '계약/발주서',
  '기타',
];

interface FilesTabProps {
  projectId: string;
  onOpenNewFile: () => void;
}

export const FilesTab: React.FC<FilesTabProps> = ({ projectId, onOpenNewFile }) => {
  const { files } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ProjectFile['type'] | '전체'>('전체');

  const projectFiles = files.filter((f) => f.projectId === projectId);
  const filteredFiles = projectFiles.filter((f) => {
    if (selectedCategory === '전체') return true;
    return f.type === selectedCategory;
  });

  const getFileIcon = (type: ProjectFile['type']) => {
    switch (type) {
      case '도면':
        return <FileCode className="h-5 w-5 text-indigo-600" />;
      case '견적서':
        return <FileSpreadsheet className="h-5 w-5 text-emerald-600" />;
      case '현장 사진':
        return <ImageIcon className="h-5 w-5 text-amber-600" />;
      case '계약/발주서':
        return <FileCheck className="h-5 w-5 text-purple-600" />;
      case '제품 사양서':
        return <FileText className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-neutral-500" />;
    }
  };

  const getCategoryBadgeClass = (type: ProjectFile['type']) => {
    switch (type) {
      case '도면':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case '견적서':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '현장 사진':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case '계약/발주서':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case '제품 사양서':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">프로젝트 첨부파일 (Files)</h2>
          <p className="text-xs text-neutral-500">
            도면(CAD/PDF), 견적서, 제품 사양서, 현장 실측 사진, 발주서를 통합 보관합니다. (총 {projectFiles.length}건)
          </p>
        </div>
        <button
          onClick={onOpenNewFile}
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors"
        >
          <Upload className="h-3.5 w-3.5" />
          파일 업로드
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        <span className="text-neutral-400 mr-1 text-[11px] flex items-center gap-1">
          <Filter className="h-3 w-3" />
          분류:
        </span>
        {FILE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-2.5 py-1 text-xs whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-neutral-900 text-white font-medium shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredFiles.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400 bg-white rounded-xl border border-dashed border-neutral-300">
          <FileText className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
          <p className="font-medium text-neutral-600">등록된 파일이 없습니다.</p>
          <p className="text-neutral-400 mt-1">도면, 견적서, 현장 사진을 업로드해보세요.</p>
          <button
            onClick={onOpenNewFile}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            파일 추가하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs space-y-3 hover:border-neutral-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                      {getFileIcon(file.type)}
                    </div>
                    <div>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[10px] border font-medium ${getCategoryBadgeClass(
                          file.type
                        )}`}
                      >
                        {file.type}
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">
                        {file.fileSize}
                      </span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-neutral-900 line-clamp-1" title={file.name}>
                  {file.name}
                </h3>

                {file.notes && (
                  <p className="text-[11px] text-neutral-600 mt-1.5 bg-neutral-50 p-2 rounded border border-neutral-100 line-clamp-2">
                    {file.notes}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(file.uploadDate)}
                </span>
                <a
                  href={file.url || '#'}
                  onClick={(e) => {
                    if (!file.url || file.url === '#') {
                      e.preventDefault();
                      alert(`파일 [${file.name}] 다운로드/미리보기가 준비되었습니다.`);
                    }
                  }}
                  className="flex items-center gap-1 font-medium text-neutral-700 hover:text-neutral-900"
                >
                  <Download className="h-3 w-3" />
                  다운로드
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
