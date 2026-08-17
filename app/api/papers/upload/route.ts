import { NextResponse } from 'next/server';
import { createJob, runGenerationPipeline } from '@/lib/agent/orchestrator';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const textContent = (formData.get('text') as string) || '';

    let fileName = '试卷文档.pdf';
    let rawContent: string | Buffer = textContent;

    if (file) {
      fileName = file.name;
      if (file.type.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        rawContent = await file.text();
      } else {
        const arrayBuffer = await file.arrayBuffer();
        rawContent = Buffer.from(arrayBuffer);
      }
    }

    const job = createJob(fileName, rawContent);

    // 启动后台 Agent 流水线
    runGenerationPipeline(job.id).catch((err) => {
      console.error(`Upload pipeline error for job ${job.id}:`, err);
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      fileName,
      status: job.status,
      message: '试卷已成功上传并启动多模态解析流水线',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '文件上传处理失败' },
      { status: 500 }
    );
  }
}
