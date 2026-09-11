export type ProjectStatus =
  | '상담'
  | '견적'
  | '견적 조정'
  | '발주 확정'
  | '납품 준비'
  | '납품'
  | '설치·검수'
  | 'A/S·추가 요청'
  | '완료';

export interface ClientContact {
  id: string;
  name: string;
  title: string;
  department: string;
  phone: string;
  email: string;
  isPrimary: boolean;
}

export interface Client {
  id: string;
  companyName: string;
  contacts: ClientContact[];
  website?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  siteName: string;
  siteAddress: string;
  status: ProjectStatus;
  deliveryDate: string;
  targetProducts: string;
  quantity: number;
  budget: string;
  latestQuoteAmount: number;
  tags: string[];
  specialNotes: string;
  createdAt: string;
  updatedAt: string;
  finalSummary?: ProjectFinalSummary;
}

export interface ChangeRecord {
  item: string;
  before: string;
  after: string;
  reason?: string;
}

export interface ConfirmedRecord {
  category: '제품' | '수량' | '사양' | '가격' | '납기';
  details: string;
}

export type ConsultationMethod =
  | '직접 녹음'
  | '녹음파일 첨부'
  | '전화 메모'
  | '대면 상담'
  | '이메일'
  | '메신저/카카오톡'
  | '현장 실측';

export interface ConsultationLog {
  id: string;
  projectId: string;
  date: string;
  method: ConsultationMethod;
  clientName: string;
  projectName: string;
  rawInput: string;
  audioDuration?: number;
  summary: string;
  requests: string[];
  changes: ChangeRecord[];
  confirmed: ConfirmedRecord[];
  pending: string[];
  followUpTasks: {
    task: string;
    dueDate?: string;
    priority?: 'high' | 'normal';
    status: '예정' | '진행 중' | '완료' | '기한 초과';
  }[];
  suggestedStatusChange?: ProjectStatus | null;
  suggestedProjectUpdates?: Partial<Project>;
  isReviewed: boolean;
  createdAt: string;
}

export interface QuoteItem {
  id: string;
  productName: string;
  option?: string;
  spec?: string;
  specification?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountRate?: number;
  amount?: number;
  totalPrice?: number;
  deliveryLeadTime?: string;
  leadTime?: string;
}

export interface QuoteDiffSummary {
  prevVersion: string;
  nextVersion: string;
  amountDifference: number;
  amountDiffText: string;
  reasonSummary: string;
  addedItems: string[];
  removedItems: string[];
  quantityChanges: string[];
  priceChanges: string[];
  leadTimeChanges?: string[];
}

export interface QuoteDiffItem {
  product: string;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
  beforeQty?: number | null;
  afterQty?: number | null;
  beforePrice?: number | null;
  afterPrice?: number | null;
  note: string;
}

export interface Quote {
  id: string;
  projectId: string;
  version: string;
  createdAt: string;
  totalAmount: number;
  currency?: string;
  items: QuoteItem[];
  changeNotes?: string;
  fileName?: string;
  fileSize?: string;
  diffSummary?: {
    beforeVersion?: string;
    beforeTotal?: number;
    difference?: number;
    summary?: string;
    diffItems?: QuoteDiffItem[];
  };
}

export type ProjectFileType =
  | '견적서'
  | '도면'
  | '제품 이미지'
  | '제품 사양서'
  | '현장 사진'
  | '발주서'
  | '계약서'
  | '계약/발주서'
  | '사업자등록증'
  | '거래명세서'
  | '세금계산서'
  | 'PDF'
  | 'Excel'
  | '기타';

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  type: ProjectFileType;
  uploadDate: string;
  fileSize: string;
  notes?: string;
  url?: string;
}

export type TaskStatus = '예정' | '진행 중' | '완료' | '기한 초과';

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  consultationId?: string;
  title: string;
  dueDate: string;
  status: TaskStatus;
  completed: boolean;
  priority?: 'high' | 'normal';
  createdAt: string;
}

export interface TimelineItem {
  id: string;
  projectId: string;
  date: string;
  title: string;
  type: 'consultation' | 'quote' | 'change' | 'order' | 'delivery' | 'file' | 'task' | 'as';
  description: string;
  badge?: string;
  refId?: string;
  refType?: 'consultation' | 'quote' | 'file' | 'task';
}

export interface AfterServiceRecord {
  id: string;
  projectId: string;
  date: string;
  type: 'A/S 요청' | '정기 점검' | '추가 요청';
  title: string;
  issue: string;
  action: string;
  status: '접수' | '처리 중' | '완료';
}

export interface ProjectFinalSummary {
  clientName?: string;
  projectName?: string;
  period?: string;
  finalDeliveryDate?: string;
  finalProductsSummary?: string;
  finalAmount?: string;
  majorChangesHistory?: string[];
  majorDecisions?: string[];
  specialNotes?: string;
  asPlan?: string;
  overview?: string;
  consultationCount?: number;
  quoteHistorySummary?: string;
  majorChangesSummary?: string;
  finalProducts?: string;
  finalQuantity?: number;
  finalRevenue?: number;
  futureSalesOpportunities?: string;
  lessonsLearned?: string;
}

export interface AIQuestionReference {
  type: '상담' | '견적' | '파일' | '태스크';
  title: string;
  date?: string;
  excerpt?: string;
}

export interface AIAnswerResponse {
  answer: string;
  references: AIQuestionReference[];
  actionNeeded?: string | null;
}
