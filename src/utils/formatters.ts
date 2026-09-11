/**
 * Formatting utilities for Korean B2B context
 */

export function formatKRW(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '0원';
  return `${Number(amount).toLocaleString('ko-KR')}원`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '미정';
  // Handle formats like YYYY-MM-DD or YYYY-MM-DD HH:mm
  const parts = dateString.split(' ');
  const datePart = parts[0];
  const timePart = parts[1] || '';

  const dateSub = datePart.split('-');
  if (dateSub.length === 3) {
    const formatted = `${dateSub[0]}.${dateSub[1]}.${dateSub[2]}`;
    return timePart ? `${formatted} ${timePart}` : formatted;
  }
  return dateString;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case '상담':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case '견적':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case '견적 조정':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case '발주 확정':
      return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium';
    case '납품 준비':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    case '납품':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case '설치·검수':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'A/S·추가 요청':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case '완료':
      return 'bg-neutral-100 text-neutral-700 border-neutral-300';
    default:
      return 'bg-neutral-100 text-neutral-600 border-neutral-200';
  }
}

export function getTaskStatusBadge(status: string): string {
  switch (status) {
    case '완료':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case '진행 중':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case '기한 초과':
      return 'bg-red-50 text-red-700 border-red-200 font-semibold';
    case '예정':
    default:
      return 'bg-neutral-100 text-neutral-700 border-neutral-200';
  }
}
