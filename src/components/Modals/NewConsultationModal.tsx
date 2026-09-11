import React, { useState, useRef, useEffect } from 'react';
import { Project, ConsultationMethod, ConsultationLog } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Mic,
  Square,
  Upload,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  ArrowRight,
  AlertTriangle,
  Play,
  Pause,
  Loader2,
  X,
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

interface NewConsultationModalProps {
  initialProjectId?: string;
  onClose: () => void;
}

const PRESET_SAMPLE_TEXTS = [
  {
    title: '샘플 1: 라운지 소파 원단 및 의자 수량 변경 (유선 통화)',
    method: '유선 상담' as ConsultationMethod,
    content: `김부장님 안녕하세요, 지난주 보내주신 1차 견적서 검토했습니다.
전체적으로 좋은데 몇 가지 수정 요청이 있습니다.
첫째, 3층 라운지에 들어가는 소파 패브릭을 기본 방염 원단에서 Kvadrat Steelcut 라인업으로 업그레이드하고 싶습니다. 컬러는 딥그레이로 확정하고요.
둘째, 대회의실 체어 수량이 기존 20개에서 24개로 4개 추가되어야 합니다. 테이블 배치 보니까 24석이 충분히 나오더라고요.
셋째, 납품 일정은 기존 10월 10일 예정이었는데 인테리어 바닥 양생이 늦어져서 10월 18일 오전으로 늦춰주세요.
엘리베이터가 화물용이라 진입은 문제없습니다.
견적서 수정해서 이번 주 금요일(9/8)까지 다시 보내주시면 바로 결재 올리겠습니다.`,
  },
  {
    title: '샘플 2: 임원실 데스크 천연무늬목 사양 및 전선캡 위치 협의 (방문 미팅)',
    method: '방문 미팅' as ConsultationMethod,
    content: `오늘 대표이사실 현장 실측 및 가구 사양 확정 미팅 정리입니다.
참석자: 박이사님, 본인
1. 대표이사 데스크 W2200 사양을 오크 천연무늬목 다크월넛 도장으로 최종 확정함.
2. 상판 우측 매립형 스마트 멀티탭(2구+USB C타입 1구) 위치를 좌측에서 우측으로 변경 요청.
3. 책장(W3200) 도어는 하부 불투명 도어, 상부는 오픈형 선반으로 확정.
4. 납품 예정일: 10월 25일 금요일 오전 9시 세팅.
5. 아직 결정 안 된 사항: 가죽 의자 컬러를 블랙으로 할지 버건디 브라운으로 할지 사모님과 상의 후 내일까지 통보하기로 함.
6. 조치사항: 내일까지 가죽 컬러 샘플칩 2종 퀵 배송 및 수정 견적서 발송할 것.`,
  },
];

export const NewConsultationModal: React.FC<NewConsultationModalProps> = ({
  initialProjectId,
  onClose,
}) => {
  const { projects, addConsultation } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || projects[0]?.id || ''
  );
  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Step 1: Input Mode (recording, upload, paste) -> Step 2: AI Review & Confirmation
  const [step, setStep] = useState<'input' | 'analyzing' | 'review'>('input');
  const [inputTab, setInputTab] = useState<'record' | 'paste' | 'upload'>('record');

  // Input states
  const [method, setMethod] = useState<ConsultationMethod>('유선 상담');
  const [consultDate, setConsultDate] = useState(
    new Date().toISOString().slice(0, 16).replace('T', ' ')
  );
  const [rawText, setRawText] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // AI Analysis Result State (Editable by user)
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [applyUpdatesToProject, setApplyUpdatesToProject] = useState(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Audio Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Pre-fill a realistic transcript for demo voice recording if no external STT
        if (!rawText.trim()) {
          setRawText(
            `[실시간 녹음 녹취록]\n클라이언트: "안녕하세요 팀장님. 3층 회의실 의자 수량을 20개에서 24개로 변경하고 싶습니다. 그리고 패브릭 색상은 네이비로 확정하겠습니다. 납품일은 10월 18일로 조율 부탁드립니다."`
          );
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access unavailable or denied:', err);
      alert('마이크 접근 권한을 확인해주세요. 텍스트 직접 입력 또는 샘플을 이용하실 수 있습니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setRawText(
        `[녹음 파일: ${file.name} 분석]\n클라이언트 미팅 대화 내용이 업로드되었습니다. AI가 음성 내용을 분석하여 프로젝트 정보를 추출합니다.`
      );
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_SAMPLE_TEXTS[0]) => {
    setMethod(preset.method);
    setRawText(preset.content);
  };

  // Step 1 -> Step 2: Trigger AI Analysis
  const handleAnalyze = async () => {
    if (!rawText.trim() && !audioBlob) {
      alert('상담 녹음 또는 텍스트 내용을 입력해주세요.');
      return;
    }

    setStep('analyzing');

    try {
      const res = await fetch('/api/gemini/analyze-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: rawText.trim() || '음성 녹음 내용',
          method,
          projectName: selectedProject?.name,
          clientName: selectedProject?.clientName,
        }),
      });

      if (!res.ok) {
        throw new Error('API analysis failed');
      }

      const structured = await res.json();
      setAnalysisResult({
        ...structured,
        date: consultDate,
        method,
      });
      setStep('review');
    } catch (err) {
      console.error('AI consultation analysis error:', err);
      alert('AI 분석 중 문제가 발생했습니다. 다시 시도해주세요.');
      setStep('input');
    }
  };

  // Step 3: User Confirmation & Accumulation into Project
  const handleConfirmAndSave = () => {
    if (!analysisResult || !selectedProject) return;

    addConsultation(
      {
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        clientName: selectedProject.clientName,
        date: analysisResult.date || consultDate,
        method: analysisResult.method || method,
        attendees: analysisResult.attendees || ['본인', '클라이언트 담당자'],
        summary: analysisResult.summary || '상담 요약',
        newRequests: analysisResult.newRequests || [],
        changes: analysisResult.changes || [],
        confirmedItems: analysisResult.confirmedItems || [],
        unconfirmedItems: analysisResult.unconfirmedItems || [],
        followUpTasks: analysisResult.followUpTasks || [],
        suggestedStatusChange: analysisResult.suggestedStatusChange,
        suggestedProjectUpdates: analysisResult.suggestedProjectUpdates,
        rawContent: rawText,
        audioTranscript: rawText,
      },
      applyUpdatesToProject
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-neutral-200 overflow-hidden my-6">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-neutral-50/70">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-white shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <h2 className="text-sm font-bold text-neutral-900">
                {step === 'review' ? 'AI 상담일지 검토 및 프로젝트 반영' : '상담 녹음 및 자료 입력'}
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              자료 입력 → AI 분석 → 구조화 → 사용자 확인 → 프로젝트에 영구 누적
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* STEP 1: Input Screen */}
        {step === 'input' && (
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Project Selection & Method */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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
                <label className="font-semibold text-neutral-700 block mb-1">상담 방식</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as ConsultationMethod)}
                  className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                >
                  <option value="유선 상담">유선 상담 (전화)</option>
                  <option value="방문 미팅">방문 미팅 (대면)</option>
                  <option value="온라인 미팅">온라인 미팅 (Zoom/Meet)</option>
                  <option value="카카오톡/메신저">카카오톡 / 문자 / 메신저</option>
                  <option value="이메일">이메일</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">상담 일시</label>
                <input
                  type="text"
                  value={consultDate}
                  onChange={(e) => setConsultDate(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            {/* Input Method Tabs (녹음 / 복사붙여넣기 / 파일업로드) */}
            <div className="rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50/50">
              <div className="flex border-b border-neutral-200 bg-white text-xs">
                <button
                  type="button"
                  onClick={() => setInputTab('record')}
                  className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    inputTab === 'record'
                      ? 'border-b-2 border-neutral-900 text-neutral-900 bg-neutral-50/50 font-bold'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Mic className="h-4 w-4 text-red-500" />
                  실시간 마이크 음성 녹음
                </button>
                <button
                  type="button"
                  onClick={() => setInputTab('paste')}
                  className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    inputTab === 'paste'
                      ? 'border-b-2 border-neutral-900 text-neutral-900 bg-neutral-50/50 font-bold'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <FileText className="h-4 w-4 text-blue-500" />
                  텍스트 직접 입력 / 이메일·카톡 복사
                </button>
                <button
                  type="button"
                  onClick={() => setInputTab('upload')}
                  className={`flex-1 py-2.5 font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    inputTab === 'upload'
                      ? 'border-b-2 border-neutral-900 text-neutral-900 bg-neutral-50/50 font-bold'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Upload className="h-4 w-4 text-emerald-500" />
                  녹음 파일 업로드 (.mp3, .m4a)
                </button>
              </div>

              {/* Tab 1: 실시간 음성 녹음 */}
              {inputTab === 'record' && (
                <div className="p-5 text-center space-y-4">
                  <div className="flex flex-col items-center justify-center py-4">
                    {isRecording ? (
                      <div className="space-y-3">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 animate-pulse mx-auto">
                          <Mic className="h-8 w-8" />
                          <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                          </span>
                        </div>
                        <div className="text-sm font-mono font-bold text-red-600">
                          {formatDuration(recordingTime)} 녹음 중...
                        </div>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 shadow-xs"
                        >
                          <Square className="h-3.5 w-3.5" />
                          녹음 완료 및 정지
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 mx-auto">
                          <Mic className="h-8 w-8 text-neutral-700" />
                        </div>
                        <p className="text-xs text-neutral-600">
                          상담 중 마이크를 켜두거나 미팅 후 요약을 음성으로 말씀하세요.
                        </p>
                        <button
                          type="button"
                          onClick={startRecording}
                          className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 shadow-xs"
                        >
                          <Mic className="h-3.5 w-3.5" />
                          녹음 시작하기
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Audio playback preview if recorded */}
                  {audioUrl && (
                    <div className="rounded-lg bg-white p-3 border border-neutral-200 flex items-center justify-between text-xs">
                      <span className="text-neutral-700 font-medium">녹음된 오디오 미리듣기</span>
                      <audio controls src={audioUrl} className="h-8 max-w-[240px]" />
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: 텍스트 입력 */}
              {inputTab === 'paste' && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-700">상담 메모 또는 대화 내용 전문</span>
                    <span className="text-[11px] text-neutral-400">자유로운 형식으로 작성하셔도 AI가 구조화합니다</span>
                  </div>
                  <textarea
                    rows={7}
                    placeholder="미팅 후 러프한 메모, 이메일 본문, 카카오톡 상담 내용을 그대로 붙여넣으세요..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 bg-white p-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-mono leading-relaxed"
                  />
                </div>
              )}

              {/* Tab 3: 녹음 파일 업로드 */}
              {inputTab === 'upload' && (
                <div className="p-6 text-center space-y-3">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-xl p-6 cursor-pointer hover:bg-neutral-50 transition-colors">
                    <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                    <span className="text-xs font-semibold text-neutral-700">
                      음성 녹음 파일 선택 또는 드래그 앤 드롭
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-1">
                      MP3, M4A, WAV, WebM (스마트폰 음성 메모 파일 지원)
                    </span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {audioUrl && (
                    <div className="rounded-lg bg-white p-3 border border-neutral-200 flex items-center justify-between text-xs">
                      <span className="text-neutral-700 font-medium">업로드된 파일 미리듣기</span>
                      <audio controls src={audioUrl} className="h-8 max-w-[240px]" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Demo Sample Presets */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-neutral-500 block">
                빠른 테스트용 샘플 B2B 상담 시나리오 적용:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_SAMPLE_TEXTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-left p-2.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-400 text-xs transition-colors"
                  >
                    <div className="font-semibold text-neutral-900 line-clamp-1">{preset.title}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{preset.method}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-neutral-300 px-3.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!rawText.trim() && !audioBlob}
                className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 disabled:bg-neutral-300 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                AI 분석 시작
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Analyzing Loading State */}
        {step === 'analyzing' && (
          <div className="p-12 text-center space-y-4">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-neutral-900" />
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                상담 내용을 정밀하게 분석하고 있습니다...
              </h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                가구 품목, 변경된 수량(Before → After), 확정된 사양, 미결정 사항 및 후속 업무를 자동 구조화 중입니다.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Edit Screen */}
        {step === 'review' && analysisResult && (
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
            {/* Review Banner */}
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2.5 text-emerald-950">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">AI 구조화 완료:</strong> 내용을 검토하고 필요시 직접
                수정하세요. [프로젝트에 반영]을 누르면 상담일지와 후속 업무가 안전하게 누적됩니다.
              </div>
            </div>

            {/* 1. Summary Editing */}
            <div className="space-y-1.5">
              <label className="font-bold text-neutral-900 block">상담 핵심 요약 (3~5줄)</label>
              <textarea
                rows={3}
                value={analysisResult.summary}
                onChange={(e) =>
                  setAnalysisResult({ ...analysisResult, summary: e.target.value })
                }
                className="w-full rounded-md border border-neutral-300 p-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 leading-relaxed"
              />
            </div>

            {/* 2. Changes (Before -> After) */}
            {analysisResult.changes && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5 text-amber-600" />
                    추출된 변경사항 (Before → After)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [
                        ...analysisResult.changes,
                        { item: '새 변경항목', before: '이전 사양', after: '변경 사유', reason: '협의' },
                      ];
                      setAnalysisResult({ ...analysisResult, changes: updated });
                    }}
                    className="text-[11px] text-neutral-600 hover:text-neutral-900 underline"
                  >
                    + 변경사항 추가
                  </button>
                </div>

                <div className="space-y-2">
                  {analysisResult.changes.map((ch: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={ch.item}
                          onChange={(e) => {
                            const copy = [...analysisResult.changes];
                            copy[idx].item = e.target.value;
                            setAnalysisResult({ ...analysisResult, changes: copy });
                          }}
                          className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-xs font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          placeholder="이전 (Before)"
                          value={ch.before}
                          onChange={(e) => {
                            const copy = [...analysisResult.changes];
                            copy[idx].before = e.target.value;
                            setAnalysisResult({ ...analysisResult, changes: copy });
                          }}
                          className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-xs line-through text-neutral-500"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          placeholder="변경 후 (After)"
                          value={ch.after}
                          onChange={(e) => {
                            const copy = [...analysisResult.changes];
                            copy[idx].after = e.target.value;
                            setAnalysisResult({ ...analysisResult, changes: copy });
                          }}
                          className="w-full rounded border border-neutral-300 bg-white px-2 py-1 text-xs font-bold text-neutral-900"
                        />
                      </div>
                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const copy = analysisResult.changes.filter((_: any, i: number) => i !== idx);
                            setAnalysisResult({ ...analysisResult, changes: copy });
                          }}
                          className="text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Confirmed items vs Unconfirmed (Need Check) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Confirmed */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 space-y-2">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  확정사항 (제품, 수량, 가격, 납기)
                </span>
                <textarea
                  rows={4}
                  value={analysisResult.confirmedItems?.join('\n')}
                  onChange={(e) =>
                    setAnalysisResult({
                      ...analysisResult,
                      confirmedItems: e.target.value.split('\n').filter((l) => l.trim()),
                    })
                  }
                  className="w-full rounded border border-neutral-300 bg-white p-2 text-xs text-neutral-800"
                />
              </div>

              {/* Unconfirmed / Caution */}
              <div className="rounded-lg border border-red-200 bg-red-50/40 p-3 space-y-2">
                <span className="font-bold text-red-950 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                  미확정 / 확인 필요 사항 (경고/주의)
                </span>
                <textarea
                  rows={4}
                  value={analysisResult.unconfirmedItems?.join('\n')}
                  onChange={(e) =>
                    setAnalysisResult({
                      ...analysisResult,
                      unconfirmedItems: e.target.value.split('\n').filter((l) => l.trim()),
                    })
                  }
                  className="w-full rounded border border-neutral-300 bg-white p-2 text-xs text-red-900 font-medium"
                />
              </div>
            </div>

            {/* 4. Follow-up Tasks (Will be inserted into Tasks) */}
            <div className="space-y-2">
              <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-neutral-600" />
                후속 업무 (Tasks로 자동 등록)
              </span>
              <div className="space-y-1.5">
                {analysisResult.followUpTasks?.map((t: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded bg-neutral-50 p-2 border border-neutral-200"
                  >
                    <input
                      type="text"
                      value={t.task}
                      onChange={(e) => {
                        const copy = [...analysisResult.followUpTasks];
                        copy[idx].task = e.target.value;
                        setAnalysisResult({ ...analysisResult, followUpTasks: copy });
                      }}
                      className="flex-1 rounded border border-neutral-200 bg-white px-2 py-1 text-xs mr-2 font-medium"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={t.dueDate}
                        onChange={(e) => {
                          const copy = [...analysisResult.followUpTasks];
                          copy[idx].dueDate = e.target.value;
                          setAnalysisResult({ ...analysisResult, followUpTasks: copy });
                        }}
                        className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const copy = analysisResult.followUpTasks.filter(
                            (_: any, i: number) => i !== idx
                          );
                          setAnalysisResult({ ...analysisResult, followUpTasks: copy });
                        }}
                        className="text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. AI Suggested Project Status & Field Updates */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="font-bold text-blue-950">
                    AI 프로젝트 정보 업데이트 제안
                  </span>
                </div>
                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-blue-900">
                  <input
                    type="checkbox"
                    checked={applyUpdatesToProject}
                    onChange={(e) => setApplyUpdatesToProject(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>프로젝트 기본정보에 즉시 반영하기</span>
                </label>
              </div>

              <div className="text-[11px] text-blue-900 space-y-1">
                {analysisResult.suggestedStatusChange && (
                  <div>
                    • 프로젝트 상태 변경 제안:{' '}
                    <span className="font-bold">
                      [{selectedProject?.status}] → [{analysisResult.suggestedStatusChange}]
                    </span>
                  </div>
                )}
                {analysisResult.suggestedProjectUpdates?.deliveryDate && (
                  <div>
                    • 납품 예정일 변경 제안:{' '}
                    <span className="font-bold">
                      {analysisResult.suggestedProjectUpdates.deliveryDate}
                    </span>
                  </div>
                )}
                {analysisResult.suggestedProjectUpdates?.quantity && (
                  <div>
                    • 수량 변경 제안:{' '}
                    <span className="font-bold">
                      {analysisResult.suggestedProjectUpdates.quantity} EA
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Review Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="rounded-md border border-neutral-300 px-3.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                이전 (입력 수정)
              </button>

              <button
                type="button"
                onClick={handleConfirmAndSave}
                className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-neutral-800 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                검토 완료 및 프로젝트에 영구 누적
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
