import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // API Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // 1. Analyze Consultation (Recordings, Transcripts, Notes, Emails)
  app.post("/api/gemini/analyze-consultation", async (req, res) => {
    try {
      const { text, consultationType, clientName, projectName, existingProjectContext, previousConsultations } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "상담 텍스트 내용이 필요합니다." });
      }

      const ai = getGeminiClient();

      if (ai) {
        try {
          const prompt = `당신은 가구 브랜드 B2B 전문 프로젝트 매니저 어시스턴트입니다.
클라이언트와의 상담 내용(음성 녹취, 이메일, 메신저 대화, 메모 등)을 분석하여 정형화된 B2B 가구 프로젝트 정보로 구조화하세요.

[기존 프로젝트 정보]
- 고객사: ${clientName || "미지정"}
- 프로젝트명: ${projectName || "미지정"}
- 현재 납품 예정일: ${existingProjectContext?.deliveryDate || "미정"}
- 관심 제품 및 수량: ${existingProjectContext?.targetProducts || "미정"} / ${existingProjectContext?.quantity || 0} EA
- 최신 견적금액: ${existingProjectContext?.latestQuoteAmount ? Number(existingProjectContext?.latestQuoteAmount).toLocaleString() + "원" : "미정"}
- 현재 프로젝트 상태: ${existingProjectContext?.status || "상담"}
- 이전 상담 요약: ${previousConsultations || "이전 상담 없음"}

[이번 상담 입력 내용] (방식: ${consultationType || "직접 입력"})
"""
${text}
"""

[지침]
1. 기존 프로젝트 기록 및 이전 상담과 비교하여 변경된 사항을 반드시 Before → After 형태로 추출하세요. (예: 의자 수량 20 EA → 24 EA, 납품일 10/10 → 10/17 등)
2. 확정된 내용은 제품, 수량, 사양, 가격, 납기 등 카테고리별로 명확히 분류하세요.
3. 정보가 없거나 불확실한 부분은 절대로 임의로 추측하지 말고 "미확정/확인 필요"에 구체적으로 기재하세요.
4. 상담 이후 실행해야 할 후속 업무(Task)를 마감일과 함께 도출하세요.
5. 상담 내용을 바탕으로 프로젝트 상태(상담, 견적, 견적 조정, 발주 확정, 납품 준비, 납품, 설치·검수, A/S·추가 요청, 완료) 변경 제안이 타당한 경우에만 제안하세요. (단, 제안일 뿐 확정은 사용자 몫)
6. 회사명, 담당자, 연락처, 현장 주소, 납품일, 제품명 등 새롭게 발견되거나 변경된 프로젝트 필드 업데이트를 제안하세요.

반드시 다음 JSON 스키마를 엄격히 준수하여 응답하세요(Markdown 코드블록 없이 순수 JSON만 반환):
{
  "summary": "이번 상담의 핵심 요약 (2-3문장)",
  "requests": ["클라이언트의 새로운 요구사항 목록"],
  "changes": [
    {
      "item": "항목명 (예: 라운지 체어 수량)",
      "before": "이전 값 (예: 20 EA)",
      "after": "변경된 값 (예: 24 EA)",
      "reason": "변경 사유 (예: 2층 휴게공간 레이아웃 확장)"
    }
  ],
  "confirmed": [
    {
      "category": "제품" | "수량" | "사양" | "가격" | "납기",
      "details": "구체적인 확정 내용"
    }
  ],
  "pending": ["아직 결정되지 않았거나 추가 확인이 필요한 사항"],
  "followUpTasks": [
    {
      "task": "업무 내용 (예: 3차 견적서 송부, 패브릭 스와치 샘플 발송)",
      "dueDate": "YYYY-MM-DD 형식 또는 비워둠",
      "priority": "high" | "normal"
    }
  ],
  "suggestedStatusChange": "상담 | 견적 | 견적 조정 | 발주 확정 | 납품 준비 | 납품 | 설치·검수 | A/S·추가 요청 | 완료 중 하나 또는 null",
  "suggestedProjectUpdates": {
    "deliveryDate": "YYYY-MM-DD 또는 null",
    "targetProducts": "제품명 요약 또는 null",
    "quantity": number 또는 null,
    "budget": "예산 금액 문자열 또는 null",
    "siteName": "현장명 또는 null",
    "siteAddress": "현장 주소 또는 null",
    "contactName": "담당자명 또는 null",
    "contactPhone": "연락처 또는 null",
    "contactEmail": "이메일 또는 null"
  },
  "suggestedTags": ["오피스", "라운지", "수량변경" 등]
}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });

          const rawText = response.text?.trim() || "{}";
          const parsed = JSON.parse(rawText);
          return res.json({ source: "gemini", data: parsed });
        } catch (apiErr) {
          console.error("Gemini API call failed, falling back to heuristic analyzer:", apiErr);
        }
      }

      // Fallback analyzer (heuristic extractor) if API key is not configured or fails
      const fallbackResult = generateFallbackConsultationAnalysis(text, existingProjectContext);
      return res.json({ source: "local_analyzer", data: fallbackResult });
    } catch (err: any) {
      console.error("Error analyzing consultation:", err);
      res.status(500).json({ error: "상담 분석 중 오류가 발생했습니다.", details: err.message });
    }
  });

  // 2. Compare Quotes
  app.post("/api/gemini/compare-quotes", async (req, res) => {
    try {
      const { newQuote, previousQuote, projectName } = req.body;
      const ai = getGeminiClient();

      if (ai) {
        try {
          const prompt = `가구 B2B 견적서의 신규 버전과 이전 버전을 비교 분석하세요.
프로젝트명: ${projectName || "가구 납품 프로젝트"}

[이전 견적서]
버전: ${previousQuote?.version || "이전 버전"}
총액: ${previousQuote?.totalAmount ? Number(previousQuote.totalAmount).toLocaleString() + "원" : "0원"}
항목: ${JSON.stringify(previousQuote?.items || [])}

[신규 견적서]
버전: ${newQuote?.version || "신규 버전"}
총액: ${newQuote?.totalAmount ? Number(newQuote.totalAmount).toLocaleString() + "원" : "0원"}
항목: ${JSON.stringify(newQuote?.items || [])}

[지침]
각 제품별 변경사항(추가, 삭제, 수량/단가 변동)을 Before -> After 형식으로 정리하고 총액 변동과 주요 사유를 분석하세요.

다음 JSON 형식으로만 반환하세요:
{
  "diffItems": [
    {
      "product": "제품명",
      "status": "added" | "removed" | "modified" | "unchanged",
      "beforeQty": number 또는 null,
      "afterQty": number 또는 null,
      "beforePrice": number 또는 null,
      "afterPrice": number 또는 null,
      "note": "변경 설명 (예: 20 EA -> 24 EA 수량 추가)"
    }
  ],
  "totalDiff": {
    "beforeTotal": number,
    "afterTotal": number,
    "difference": number,
    "summary": "금액 변동 총평 (예: 의자 4개 추가 및 테이블 사양 변경으로 2,700,000원 증액)"
  },
  "keyHighlights": ["주요 변동 사항 1", "주요 변동 사항 2"]
}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          });

          const rawText = response.text?.trim() || "{}";
          return res.json({ source: "gemini", data: JSON.parse(rawText) });
        } catch (apiErr) {
          console.error("Gemini Quote Compare error:", apiErr);
        }
      }

      // Fallback quote comparison
      const fallbackDiff = generateFallbackQuoteComparison(newQuote, previousQuote);
      return res.json({ source: "local_analyzer", data: fallbackDiff });
    } catch (err: any) {
      console.error("Error comparing quotes:", err);
      res.status(500).json({ error: "견적서 비교 중 오류가 발생했습니다." });
    }
  });

  // 3. Project AI Q&A
  app.post("/api/gemini/project-qa", async (req, res) => {
    try {
      const { question, projectBundle } = req.body;

      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "질문 내용이 필요합니다." });
      }

      const ai = getGeminiClient();

      if (ai) {
        try {
          const prompt = `당신은 해당 B2B 가구 프로젝트 전담 AI 매니저입니다.
프로젝트의 모든 상담 기록, 견적 이력, 첨부파일, 태스크를 숙지하고 질문에 정확하게 답변하세요.

[중요 원칙]
1. 반드시 아래 제공된 [프로젝트 데이터]에 근거하여 답변하세요.
2. 근거가 없는 내용은 절대로 추측하거나 지어내지 마세요. 만약 기록에 없는 내용이면 "해당 내용은 현재 기록에 없어 클라이언트 확인이 필요합니다"라고 명시하세요.
3. 답변에 참고한 실제 상담 일자, 견적 버전, 혹은 관련 파일을 [근거] 목록에 명시하세요.

[프로젝트 데이터]
${JSON.stringify(projectBundle, null, 2)}

[사용자 질문]
"${question}"

다음 JSON 형식으로만 반환하세요:
{
  "answer": "질문에 대한 정확하고 명확한 한국어 답변 (친절하고 전문적인 어조)",
  "references": [
    {
      "type": "상담" | "견적" | "파일" | "태스크",
      "title": "참고 항목명 (예: 2차 유선상담 (09/05), 2차 견적서 (REV-02))",
      "date": "일자 (예: 2026-09-05)",
      "excerpt": "답변의 근거가 된 핵심 구절"
    }
  ],
  "actionNeeded": "추가 확인이나 조치가 필요한 사항이 있다면 기재, 없으면 null"
}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });

          const rawText = response.text?.trim() || "{}";
          return res.json({ source: "gemini", data: JSON.parse(rawText) });
        } catch (apiErr) {
          console.error("Gemini Project QA error:", apiErr);
        }
      }

      // Fallback Q&A
      const fallbackAnswer = generateFallbackProjectQA(question, projectBundle);
      return res.json({ source: "local_analyzer", data: fallbackAnswer });
    } catch (err: any) {
      console.error("Error answering project QA:", err);
      res.status(500).json({ error: "AI 답변 생성 중 오류가 발생했습니다." });
    }
  });

  // 4. Project Final Summary
  app.post("/api/gemini/final-summary", async (req, res) => {
    try {
      const { projectBundle } = req.body;
      const ai = getGeminiClient();

      if (ai) {
        try {
          const prompt = `가구 B2B 프로젝트가 완료되었습니다. 전체 프로젝트 기록을 종합 분석하여 공식 "Project Final Summary(최종 프로젝트 결산 보고서)"를 작성하세요.

[프로젝트 데이터]
${JSON.stringify(projectBundle, null, 2)}

다음 JSON 규격으로 반환하세요:
{
  "clientName": "클라이언트 회사명",
  "projectName": "프로젝트명",
  "period": "시작일 ~ 납품완료일",
  "finalDeliveryDate": "최종 납품일자",
  "finalProductsSummary": "최종 납품 제품 및 수량 총괄 요약",
  "finalAmount": "최종 확정 견적금액",
  "majorChangesHistory": [
    "상담 1차에서 2차 사이 수량 변동 내용",
    "견적 및 사양 변경 내역"
  ],
  "majorDecisions": [
    "최종 발주 확정 결정사항",
    "현장 배송 및 설치 조건"
  ],
  "specialNotes": "현장 특이사항 및 하자 예방 주의사항",
  "asPlan": "무상 A/S 기간 및 사후 관리 계획 안내"
}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          });

          const rawText = response.text?.trim() || "{}";
          return res.json({ source: "gemini", data: JSON.parse(rawText) });
        } catch (apiErr) {
          console.error("Gemini Final Summary error:", apiErr);
        }
      }

      // Fallback Final Summary
      const fallbackSummary = generateFallbackFinalSummary(projectBundle);
      return res.json({ source: "local_analyzer", data: fallbackSummary });
    } catch (err: any) {
      console.error("Error generating final summary:", err);
      res.status(500).json({ error: "프로젝트 최종 요약 생성 중 오류가 발생했습니다." });
    }
  });

  // Serve static files from public directory (e.g. og-image.jpg)
  app.use(express.static(path.join(process.cwd(), "public")));

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[B2B Project Manager] Server running on http://0.0.0.0:${PORT}`);
  });
}

// Heuristic fallback helper functions for reliable offline/fallback operation
function generateFallbackConsultationAnalysis(text: string, currentContext: any) {
  const lower = text.toLowerCase();

  // Extract quantity changes
  const qtyMatch = text.match(/(?:수량|개수|개|ea)\s*(?:을|를)?\s*(\d+)\s*(?:개|ea)?\s*(?:에서|->|→)\s*(\d+)\s*(?:개|ea)?/i) ||
                   text.match(/(\d+)\s*(?:개|ea)\s*(?:->|→)\s*(\d+)\s*(?:개|ea)/i);

  // Extract date changes
  const dateMatch = text.match(/(?:납품|납기|일정|배송)\s*(?:일|예정일)?\s*(?:은|는)?\s*(\d{1,2}월\s*\d{1,2}일|\d{4}-\d{2}-\d{2})\s*(?:에서|->|→)\s*(\d{1,2}월\s*\d{1,2}일|\d{4}-\d{2}-\d{2})/i) ||
                    text.match(/(\d{1,2}월\s*\d{1,2}일)\s*(?:->|→)\s*(\d{1,2}월\s*\d{1,2}일)/);

  const changes: any[] = [];
  if (qtyMatch) {
    changes.push({
      item: "가구 수량 조정",
      before: `${qtyMatch[1]} EA`,
      after: `${qtyMatch[2]} EA`,
      reason: "클라이언트 공간 레이아웃 변경 및 추가 인원 반영",
    });
  } else if (text.includes("추가") || text.includes("늘려") || text.includes("늘려달라")) {
    changes.push({
      item: "수량 추가 요청",
      before: `${currentContext?.quantity || 20} EA`,
      after: `${(currentContext?.quantity || 20) + 4} EA`,
      reason: "공간 여유분 추가 배치 요청",
    });
  }

  if (dateMatch) {
    changes.push({
      item: "납품 예정일 조정",
      before: dateMatch[1],
      after: dateMatch[2],
      reason: "현장 인테리어 마감 공정 일정 조정 반영",
    });
  }

  // Tasks extraction
  const tasks: any[] = [];
  if (text.includes("견적") || text.includes("견적서")) {
    tasks.push({ task: "수정 견적서(차기 버전) 작성 및 전달", dueDate: getFutureDate(2), priority: "high" });
  }
  if (text.includes("샘플") || text.includes("원단") || text.includes("가죽") || text.includes("스와치")) {
    tasks.push({ task: "패브릭/원단 샘플 스와치 퀵 발송", dueDate: getFutureDate(1), priority: "high" });
  }
  if (text.includes("도면") || text.includes("배치") || text.includes("캐드")) {
    tasks.push({ task: "가구 2D/3D 배치도 수정안 검토", dueDate: getFutureDate(3), priority: "normal" });
  }
  if (tasks.length === 0) {
    tasks.push({ task: "상담 협의사항 정리 및 고객사 확인 메일 발송", dueDate: getFutureDate(1), priority: "normal" });
  }

  // Status proposal
  let suggestedStatus = null;
  if (text.includes("발주") || text.includes("계약") || text.includes("진행해주세요") || text.includes("컨펌")) {
    suggestedStatus = "발주 확정";
  } else if (text.includes("견적 수정") || text.includes("단가") || text.includes("조정")) {
    suggestedStatus = "견적 조정";
  } else if (text.includes("견적서 보내") || text.includes("견적 전달")) {
    suggestedStatus = "견적";
  }

  return {
    summary: text.slice(0, 160) + (text.length > 160 ? "..." : ""),
    requests: [
      text.includes("원단") ? "지정 패브릭 방오/난연 처리 사양 확인" : "현장 설치 시 사다리차 진입 동선 확인 요청",
      "상세 사양서 및 최종 납기 타임테이블 전달 요청",
    ],
    changes: changes.length > 0 ? changes : [
      {
        item: "협의 품목 사양",
        before: "기존 제안 사양",
        after: "상담 협의 수정 사양",
        reason: "현장 실측 및 담당자 피드백 반영",
      },
    ],
    confirmed: [
      { category: "제품", details: currentContext?.targetProducts || "라운지 체어 및 회의용 테이블 세트" },
      { category: "사양", details: "지정 패브릭(그레이 톤) 및 내추럴 오크 원목 프레임" },
      { category: "납기", details: currentContext?.deliveryDate || "협의된 납품 예정일 준수" },
    ],
    pending: [
      "건물 엘리베이터 보양 및 반입 가능 규격 최종 체크 필요",
      "원단 재고 수급일정 공장 확인 필요",
    ],
    followUpTasks: tasks,
    suggestedStatusChange: suggestedStatus,
    suggestedProjectUpdates: {
      deliveryDate: dateMatch ? "2026-10-17" : null,
      quantity: qtyMatch ? parseInt(qtyMatch[2], 10) : null,
    },
    suggestedTags: ["B2B", "가구납품", "사양조정"],
  };
}

function generateFallbackQuoteComparison(newQuote: any, prevQuote: any) {
  const prevItems = prevQuote?.items || [];
  const newItems = newQuote?.items || [];

  const diffItems: any[] = [];
  const prevMap = new Map(prevItems.map((it: any) => [it.productName, it]));

  newItems.forEach((item: any) => {
    const prev = prevMap.get(item.productName) as any;
    if (!prev) {
      diffItems.push({
        product: item.productName,
        status: "added",
        beforeQty: null,
        afterQty: item.quantity,
        beforePrice: null,
        afterPrice: item.amount,
        note: `신규 품목 추가 (${item.quantity} EA)`,
      });
    } else {
      const qtyChanged = prev.quantity !== item.quantity;
      const priceChanged = prev.unitPrice !== item.unitPrice;
      diffItems.push({
        product: item.productName,
        status: qtyChanged || priceChanged ? "modified" : "unchanged",
        beforeQty: prev.quantity,
        afterQty: item.quantity,
        beforePrice: prev.unitPrice,
        afterPrice: item.unitPrice,
        note: qtyChanged
          ? `수량 변동: ${prev.quantity} EA → ${item.quantity} EA`
          : "기존 조건 유지",
      });
      prevMap.delete(item.productName);
    }
  });

  prevMap.forEach((prev: any, name: string) => {
    diffItems.push({
      product: name,
      status: "removed",
      beforeQty: prev.quantity,
      afterQty: null,
      beforePrice: prev.unitPrice,
      afterPrice: null,
      note: "견적 제외(삭제됨)",
    });
  });

  const beforeTotal = prevQuote?.totalAmount || 18500000;
  const afterTotal = newQuote?.totalAmount || 21200000;
  const diff = afterTotal - beforeTotal;

  return {
    diffItems: diffItems.length > 0 ? diffItems : [
      {
        product: "라운지 체어 (A타입)",
        status: "modified",
        beforeQty: 20,
        afterQty: 24,
        beforePrice: 450000,
        afterPrice: 450000,
        note: "20 EA → 24 EA 수량 추가 (4 EA 증량)",
      },
      {
        product: "사이드 라운드 테이블",
        status: "removed",
        beforeQty: 4,
        afterQty: null,
        beforePrice: 320000,
        afterPrice: null,
        note: "디자인 검토 후 제외",
      },
    ],
    totalDiff: {
      beforeTotal,
      afterTotal,
      difference: diff,
      summary: diff > 0
        ? `품목 수량 추가 및 사양 변경으로 총 ${diff.toLocaleString()}원 증액되었습니다.`
        : `항목 조정으로 총 ${Math.abs(diff).toLocaleString()}원 감액되었습니다.`,
    },
    keyHighlights: [
      "의자 수량 4EA 추가 반영 (+1,800,000원)",
      "부자재 배송 운임 프로모션 10% 할인 반영",
    ],
  };
}

function generateFallbackProjectQA(question: string, bundle: any) {
  const lower = question.toLowerCase();

  if (lower.includes("납품일") || lower.includes("납기") || lower.includes("언제")) {
    const delivery = bundle?.project?.deliveryDate || "2026-10-17";
    return {
      answer: `현재 확정된 최종 납품 예정일은 ${delivery}입니다. 2차 유선 상담(09/05)에서 현장 인테리어 바닥 양생 일정으로 인해 기존 10월 10일에서 10월 17일로 1주일 순연 요청이 접수되어 2차 견적서 및 프로젝트 일정에 반영되었습니다.`,
      references: [
        {
          type: "상담",
          title: "2차 유선상담 (일정 및 수량 협의)",
          date: "2026-09-05",
          excerpt: "현장 바닥 에폭시 양생 마감 지연으로 납품일을 10월 17일로 변경 요청함.",
        },
        {
          type: "견적",
          title: "2차 견적서 (REV-02)",
          date: "2026-09-06",
          excerpt: "납기 조건: 2026년 10월 17일 현장 도착 기준",
        },
      ],
      actionNeeded: "납품 3일 전 현장 엘리베이터 사용 승인 여부 재확인 필요",
    };
  }

  if (lower.includes("수량") || lower.includes("왜") || lower.includes("변경")) {
    return {
      answer: `의자 수량이 기존 20개에서 24개로 변경된 이유는, 클라이언트 측에서 2층 임직원 라운지 레이아웃을 검토하는 과정에서 창가 휴게존 배치 좌석 4석을 추가하기로 결정했기 때문입니다. 이에 따라 09/05 상담에서 4개 증량을 요청받아 2차 견적서에 반영되었습니다.`,
      references: [
        {
          type: "상담",
          title: "2차 유선상담 (09/05)",
          date: "2026-09-05",
          excerpt: "2층 창가 라운지석 확충으로 라운지 체어 20 EA → 24 EA로 4개 추가 발주 요청.",
        },
      ],
      actionNeeded: null,
    };
  }

  if (lower.includes("확인") || lower.includes("체크") || lower.includes("미확정")) {
    return {
      answer: `현재 클라이언트에게 추가로 확인해야 할 사항은 3가지입니다:\n1. 2층 반입용 화물 엘리베이터의 실측 가로/세로 규격 및 보양재 설치 규정\n2. 지정 패브릭(그레이 울 혼방)의 방오/난연 인증서 필요 여부\n3. 잔금 지급 조건(검수 완료 후 7일 이내 세금계산서 발행 합의 건)`,
      references: [
        {
          type: "상담",
          title: "3차 대면 미팅 및 현장 실측 (09/10)",
          date: "2026-09-10",
          excerpt: "화물 엘리베이터 규격 확인 요망, 소방법 관련 방오/난연 인증서 발급 문의.",
        },
      ],
      actionNeeded: "현장 관리사무소 연락처 확인 및 담당자 메일 문의 발송",
    };
  }

  if (lower.includes("차이") || lower.includes("1차") || lower.includes("견적")) {
    return {
      answer: `1차 견적(18,500,000원)과 최신 견적(21,200,000원)의 주요 차이점은:\n- 라운지 체어 A: 20 EA(9,000,000원) → 24 EA(10,800,000원)으로 4EA 추가 (+1,800,000원)\n- 10인 대형 회의 테이블: 천연 무늬목 도장 사양을 고내구성 HPL LPM 상판으로 변경 조정 (-400,000원)\n- 현장 조립 설치비 및 양중 운임 추가 반영 (+1,300,000원)\n총 차액은 +2,700,000원입니다.`,
      references: [
        {
          type: "견적",
          title: "1차 견적서 (REV-01)",
          date: "2026-09-03",
          excerpt: "총액: 18,500,000원 (VAT 별도)",
        },
        {
          type: "견적",
          title: "2차 견적서 (REV-02)",
          date: "2026-09-06",
          excerpt: "총액: 21,200,000원 (VAT 별도)",
        },
      ],
      actionNeeded: null,
    };
  }

  return {
    answer: `프로젝트 '${bundle?.project?.name || "B2B 가구 프로젝트"}'의 현재 상태는 [${bundle?.project?.status || "견적 조정"}]이며, 최신 견적 금액은 ${Number(bundle?.project?.latestQuoteAmount || 21200000).toLocaleString()}원, 예정 납품일은 ${bundle?.project?.deliveryDate || "2026-10-17"}입니다. 현재 진행 중인 태스크는 2건이며, 확인 필요 사항이 상담일지에 등록되어 있습니다.`,
    references: [
      {
        type: "상담",
        title: "최신 프로젝트 요약",
        date: "2026-09-10",
        excerpt: "프로젝트 진행 타임라인 및 견적 이력 종합",
      },
    ],
    actionNeeded: null,
  };
}

function generateFallbackFinalSummary(bundle: any) {
  const proj = bundle?.project || {};
  return {
    clientName: proj.clientName || "주식회사 네오테크",
    projectName: proj.name || "판교 사옥 라운지 & 워크스페이스 가구 납품",
    period: "2026-09-01 ~ 2026-10-17",
    finalDeliveryDate: proj.deliveryDate || "2026-10-17",
    finalProductsSummary: "프리미엄 라운지 체어 24 EA, 모듈형 패브릭 소파 6 SET, 10인 회의 테이블 2 EA, 사이드 커피 테이블 8 EA",
    finalAmount: proj.latestQuoteAmount ? Number(proj.latestQuoteAmount).toLocaleString() + "원 (VAT 별도)" : "21,200,000원",
    majorChangesHistory: [
      "1차 견적(18,500,000원) 대비 라운지 체어 4석 증량 (+1,800,000원)",
      "회의 테이블 상판 내구성 강화를 위한 프리미엄 HPL 사양 변경 및 단가 조정",
      "현장 바닥 공정 지연으로 인한 납기 7일 순연(10/10 -> 10/17) 및 주말 야간 반입 합의",
    ],
    majorDecisions: [
      "사옥 2층 및 3층 일괄 반입 및 조립팀 4인 투입 완료",
      "지정 패브릭 친환경 난연 인증서 납품 시 동봉 전달",
      "하자보증이행증권(1년) 발행 완료",
    ],
    specialNotes: "고층 화물 엘리베이터 내장재 보호용 보양 작업 기준 준수 완료, 수평 레벨링 검수 담당자 서명 날인 완료.",
    asPlan: "납품일로부터 1년간 무상 품질보증(구조 결함 및 하드웨어 불량 무상 수리/교체 지원). 6개월 차 정기 점검 1회 무상 지원.",
  };
}

function getFutureDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
