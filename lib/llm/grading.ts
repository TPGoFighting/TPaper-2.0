import { callQwenLLM, extractJsonFromMarkdown } from './client';

export interface SubjectiveGradeRequest {
  question: string;
  answer: string;
  referenceAnswer?: unknown;
  explanation?: unknown;
  points: number;
}

export interface SubjectiveGrade {
  score: number;
  feedback: string;
  strengths: string[];
  missingPoints: string[];
  confidence: 'high' | 'medium' | 'low';
}

function toPlainText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(toPlainText).join('、');
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key}: ${toPlainText(item)}`)
      .join('\n');
  }
  return String(value);
}

export function normalizeSubjectiveGrade(raw: any, maxPoints: number): SubjectiveGrade {
  const score = Number(raw?.score);
  const safeMax = Math.max(0, Number.isFinite(maxPoints) ? maxPoints : 0);
  const confidence = raw?.confidence === 'high' || raw?.confidence === 'low' ? raw.confidence : 'medium';

  return {
    score: Math.min(safeMax, Math.max(0, Number.isFinite(score) ? score : 0)),
    feedback: toPlainText(raw?.feedback || '模型未提供具体反馈'),
    strengths: Array.isArray(raw?.strengths) ? raw.strengths.map(toPlainText).filter(Boolean) : [],
    missingPoints: Array.isArray(raw?.missingPoints) ? raw.missingPoints.map(toPlainText).filter(Boolean) : [],
    confidence,
  };
}

export async function gradeSubjectiveAnswer(request: SubjectiveGradeRequest): Promise<SubjectiveGrade> {
  const maxPoints = Math.max(0, Math.min(100, Number(request.points) || 0));
  const messages = [
    {
      role: 'system' as const,
      content: `你是严格、客观的大学课程主观题阅卷老师。请依据题目、参考答案和解析评分，不要因为答案字数长就给分，也不要补写学生没有表达的内容。
只输出 JSON，不要 Markdown：
{
  "score": 0,
  "feedback": "一句话总评",
  "strengths": ["答对的关键点"],
  "missingPoints": ["遗漏或错误的关键点"],
  "confidence": "high|medium|low"
}
score 必须是 0 到 ${maxPoints} 之间的数字。`,
    },
    {
      role: 'user' as const,
      content: JSON.stringify({
        question: request.question,
        studentAnswer: request.answer,
        referenceAnswer: toPlainText(request.referenceAnswer),
        explanation: toPlainText(request.explanation),
        maxPoints,
      }),
    },
  ];

  const rawResponse = await callQwenLLM(messages, {
    model: process.env.QWEN_GRADING_MODEL || process.env.QWEN_MODEL || 'qwen-plus',
    temperature: 0.1,
    maxTokens: 1200,
    timeoutMs: Number(process.env.QWEN_GRADING_TIMEOUT_MS || 45000),
  });

  return normalizeSubjectiveGrade(extractJsonFromMarkdown(rawResponse), maxPoints);
}
