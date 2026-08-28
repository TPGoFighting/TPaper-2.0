import { NextResponse } from 'next/server';
import { gradeSubjectiveAnswer } from '../../../../lib/llm/grading';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  const answer = typeof body?.answer === 'string' ? body.answer.trim() : '';
  const points = Number(body?.points);

  if (!question || !answer || !Number.isFinite(points) || points <= 0 || points > 100) {
    return NextResponse.json(
      { success: false, error: '评分请求缺少题目、答案或有效分值' },
      { status: 400 }
    );
  }

  try {
    const grade = await gradeSubjectiveAnswer({
      question,
      answer,
      referenceAnswer: body.referenceAnswer,
      explanation: body.explanation,
      points,
    });
    return NextResponse.json({ success: true, grade });
  } catch (error: any) {
    const message = error?.message || '大模型评分失败';
    const status = /QWEN_API_KEY/.test(message) ? 503 : 502;
    return NextResponse.json({ success: false, error: message, retryable: status === 502 }, { status });
  }
}
