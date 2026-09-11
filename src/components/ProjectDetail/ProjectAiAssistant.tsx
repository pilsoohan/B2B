import React, { useState } from 'react';
import { Project } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  BookOpen,
  HelpCircle,
  X,
  Loader2,
  Calendar,
} from 'lucide-react';

interface ProjectAiAssistantProps {
  project: Project;
  onClose?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  citations?: { source: string; date?: string; note?: string }[];
  timestamp: string;
}

const SAMPLE_QUESTIONS = [
  '이 프로젝트에서 의자 수량이 언제 왜 바뀌었지?',
  '클라이언트가 원단 및 마감에 대해 마지막으로 요구한 게 뭐야?',
  '견적서 1차와 2차의 주요 차이가 뭐지?',
  '아직 확정 안 된 미해결 사항이 남아 있나?',
];

export const ProjectAiAssistant: React.FC<ProjectAiAssistantProps> = ({
  project,
  onClose,
}) => {
  const { consultations, quotes, files, tasks, timeline } = useApp();

  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `안녕하세요! **${project.name}** 프로젝트 AI 어시스턴트입니다.\n누적된 상담 기록, 견적서 버전, 변경 히스토리 및 첨부파일을 바탕으로 정확한 근거와 함께 답변해 드립니다. 무엇이 궁금하신가요?`,
      timestamp: '지금',
    },
  ]);

  const handleSend = async (qText?: string) => {
    const question = qText || inputQuestion;
    if (!question.trim() || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: question.trim(),
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!qText) setInputQuestion('');
    setLoading(true);

    try {
      // Filter context for this project
      const projConsultations = consultations.filter((c) => c.projectId === project.id);
      const projQuotes = quotes.filter((q) => q.projectId === project.id);
      const projFiles = files.filter((f) => f.projectId === project.id);
      const projTasks = tasks.filter((t) => t.projectId === project.id);
      const projTimeline = timeline.filter((t) => t.projectId === project.id);

      const res = await fetch('/api/gemini/project-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          project,
          consultations: projConsultations,
          quotes: projQuotes,
          files: projFiles,
          tasks: projTasks,
          timeline: projTimeline,
        }),
      });

      if (!res.ok) {
        throw new Error('API response failed');
      }

      const data = await res.json();

      const aiMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: data.answer || '답변을 불러오지 못했습니다.',
        citations: data.citations || [],
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Project Q&A error:', err);
      // Fallback message
      const errorMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: `죄송합니다. 질의 처리 중 오류가 발생했습니다. 프로젝트 기본 정보와 최근 상담 기록을 다시 확인해주세요.`,
        timestamp: '오류',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 bg-neutral-50/70">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-xs">
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900">Project AI 어시스턴트</h3>
            <p className="text-[10px] text-neutral-500">프로젝트 기록 기반 팩트 체크 및 근거 제공</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggested Prompt Pills */}
      <div className="px-4 py-2.5 bg-neutral-50/40 border-b border-neutral-100 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
        <span className="text-neutral-400 whitespace-nowrap flex items-center gap-1 font-medium">
          <HelpCircle className="h-3 w-3" /> 추천 질문:
        </span>
        {SAMPLE_QUESTIONS.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            disabled={loading}
            className="whitespace-nowrap rounded-full bg-white border border-neutral-200 px-2.5 py-1 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 shadow-2xs transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white mt-0.5">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}

            <div
              className={`max-w-[82%] rounded-xl p-3.5 space-y-2 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-50 border border-neutral-200 text-neutral-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Citations block */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-neutral-200/80 space-y-1 text-[11px]">
                  <div className="font-semibold text-neutral-600 flex items-center gap-1">
                    <BookOpen className="h-3 w-3 text-amber-600" />
                    참조 근거:
                  </div>
                  {m.citations.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="bg-white/80 p-1.5 rounded border border-neutral-200 text-neutral-700 flex items-start justify-between gap-1"
                    >
                      <span className="font-medium text-neutral-900">{c.source}</span>
                      {c.date && <span className="text-neutral-400 text-[10px]">{c.date}</span>}
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] ${
                  m.sender === 'user' ? 'text-neutral-300' : 'text-neutral-400'
                } text-right`}
              >
                {m.timestamp}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 mt-0.5">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-center text-xs text-neutral-500 bg-neutral-50 p-3 rounded-xl border border-neutral-200 w-fit">
            <Loader2 className="h-4 w-4 animate-spin text-neutral-600" />
            <span>상담일지 및 견적 데이터를 탐색 중입니다...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="border-t border-neutral-200 p-3 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="프로젝트 관련 궁금한 내용을 질문하세요..."
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          disabled={loading}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !inputQuestion.trim()}
          className="rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:bg-neutral-300 transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
};
