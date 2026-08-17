import { PaperBrief, ExperiencePlan } from './types';
import { SamplePaper } from '../sample-papers';
import { generateStandaloneTestHtml } from '../html-generator';

/**
 * 04 / HTML Builder Agent
 * 将结构化试卷与 ExperiencePlan 综合编译为完整独立的单文件交互式 HTML 产物。
 */
export async function buildHtmlArtifact(
  _brief: PaperBrief,
  _plan: ExperiencePlan,
  paper: SamplePaper
): Promise<string> {
  return generateStandaloneTestHtml(paper);
}
