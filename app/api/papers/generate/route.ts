import { NextResponse } from 'next/server';
import { createJob, runGenerationPipeline } from '@/lib/agent/orchestrator';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const fileName = body.fileName || '高考物理力学强化.docx';

    const job = createJob(fileName);

    // 触发后台异步 Agent 流水线
    runGenerationPipeline(job.id).catch((err) => {
      console.error(`Job ${job.id} pipeline error:`, err);
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      message: 'Agent 生成流水线已启动',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '启动生成失败' },
      { status: 500 }
    );
  }
}
