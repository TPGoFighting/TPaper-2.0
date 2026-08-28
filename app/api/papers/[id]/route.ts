import { NextResponse } from 'next/server';
import { getPaperById } from '@/lib/agent/orchestrator';
import { SAMPLE_PAPERS } from '@/lib/sample-papers';
import { generateStandaloneTestHtml } from '@/lib/html-generator';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const paper = getPaperById(id) || SAMPLE_PAPERS[id];

  if (!paper) {
    return NextResponse.json(
      { success: false, error: `未找到试卷 ${id}` },
      { status: 404 }
    );
  }

  const origin = new URL(req.url).origin;
  const html = generateStandaloneTestHtml(paper, {
    gradingEndpoint: `${origin}/api/papers/grade`,
    parentOrigin: origin,
    logoSrc: '/tabbit-logo.jpg',
  });

  return NextResponse.json({
    success: true,
    paper,
    html,
  });
}
