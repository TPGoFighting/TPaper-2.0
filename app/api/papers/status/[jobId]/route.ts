import { NextResponse } from 'next/server';
import { getJob, getPaperById } from '@/lib/agent/orchestrator';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = getJob(jobId);

  if (!job) {
    return NextResponse.json(
      { success: false, error: '未找到该转换任务' },
      { status: 404 }
    );
  }

  const paperId = (job as any).paperId;
  const paper = paperId ? getPaperById(paperId) : undefined;

  return NextResponse.json({
    success: true,
    job: {
      id: job.id,
      fileName: job.fileName,
      status: job.status,
      progressPercent: job.progressPercent,
      steps: job.steps,
      brief: job.brief,
      paperId,
      paper,
      hasArtifact: !!job.htmlArtifact,
      updatedAt: job.updatedAt,
      error: job.error,
    },
  });
}
