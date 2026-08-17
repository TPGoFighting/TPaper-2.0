import { GenerationJob, JobStatus, StepLog } from './types';
import { intakeDocument } from './document-intake';
import { understandPaperWithLLM } from './paper-understanding';
import { designExperience } from './experience-designer';
import { buildHtmlArtifact } from './html-builder';
import { reviewArtifact } from './reviewer';
import { SamplePaper, SAMPLE_PAPERS } from '../sample-papers';

// 内存中维护当前活动任务与动态生成的试卷存储
const jobsStore = new Map<string, GenerationJob>();
export const dynamicPapersStore = new Map<string, SamplePaper>();

export function getJob(id: string): GenerationJob | undefined {
  return jobsStore.get(id);
}

export function getPaperById(id: string): SamplePaper | undefined {
  return dynamicPapersStore.get(id) || SAMPLE_PAPERS[id];
}

export function createJob(fileName: string, rawContent?: any): GenerationJob {
  const id = 'job_' + Math.random().toString(36).substring(2, 9);
  const now = Date.now();
  const job: GenerationJob = {
    id,
    createdAt: now,
    updatedAt: now,
    status: 'uploaded',
    progressPercent: 0,
    fileName,
    steps: [
      {
        step: 'uploaded',
        title: '文档上传完成',
        message: `已接收试卷文件: ${fileName}`,
        timestamp: now,
        percent: 10,
      }
    ],
  };
  (job as any).rawContent = rawContent;
  jobsStore.set(id, job);
  return job;
}

function updateJobStep(
  job: GenerationJob,
  status: JobStatus,
  title: string,
  message: string,
  percent: number
) {
  const log: StepLog = {
    step: status,
    title,
    message,
    timestamp: Date.now(),
    percent,
  };
  job.status = status;
  job.progressPercent = percent;
  job.updatedAt = Date.now();
  job.steps.push(log);
}

/**
 * 运行基于 Qwen 多模态 LLM 的 Agent 自动闭环流水线
 */
export async function runGenerationPipeline(jobId: string): Promise<GenerationJob> {
  const job = jobsStore.get(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  try {
    const rawContent = (job as any).rawContent || (job as any).rawText;

    // 步骤 1: 解析文档
    updateJobStep(job, 'parsing', '解析原始文档', '多模态引擎正在分块提取题目文本、公式与结构...', 25);
    const docPkg = await intakeDocument(job.fileName, rawContent);

    // 步骤 2: Qwen LLM 理解试卷
    updateJobStep(job, 'understanding', 'Qwen LLM 试卷深度理解', '多模态大模型深度提取题目、LaTeX 公式与分步推导解析...', 50);
    const { brief, structuredPaper } = await understandPaperWithLLM(docPkg);
    job.brief = brief;
    (job as any).paperId = structuredPaper.id;

    // 注册到动态试卷存储库
    dynamicPapersStore.set(structuredPaper.id, structuredPaper);

    // 步骤 3: 体验架构设计
    updateJobStep(job, 'designing', '体验架构与布局设计', '为试卷定制自适应答题体验、倒计时与自动评分机制...', 70);
    const plan = await designExperience(brief);
    job.experiencePlan = plan;

    // 步骤 4: 编写 HTML Artifact
    updateJobStep(job, 'generating', '编写独立 HTML 产物', '生成内置样式、KaTeX 矢量公式、实时评分与解析抽屉...', 85);
    const html = await buildHtmlArtifact(brief, plan, structuredPaper);

    // 步骤 5: 双重 QA 审核
    updateJobStep(job, 'verifying', '产物自动化质检验收', '核对题目数量、否定词识别、公式闭合与脚本安全沙箱...', 94);
    const review = await reviewArtifact(html, brief, plan);

    if (!review.passed && review.issues.length > 0) {
      updateJobStep(job, 'repairing', '自动修复微小缺陷', `修复: ${review.issues.join(', ')}`, 97);
    }

    job.htmlArtifact = review.repairedHtml || html;
    updateJobStep(job, 'ready', '交互式试卷已生成', `试卷《${structuredPaper.title}》已成功发布，可直接作答！`, 100);

    return job;
  } catch (err: any) {
    job.status = 'failed';
    job.error = err.message || '生成流水线执行失败';
    job.updatedAt = Date.now();
    return job;
  }
}
