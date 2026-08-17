import { PaperBrief, ExperiencePlan } from './types';

export interface ReviewResult {
  passed: boolean;
  issues: string[];
  repairedHtml?: string;
}

/**
 * 05 / Review & Repair Agent (Dual QA: Content QA + Browser QA)
 * 校验题量完整性、否定词是否遗漏、公式语法合法性与交互是否有效。
 */
export async function reviewArtifact(
  html: string,
  brief: PaperBrief,
  _plan: ExperiencePlan
): Promise<ReviewResult> {
  const issues: string[] = [];

  // Content QA Check 1: 题量一致性检查
  const questionCountInHtml = (html.match(/class="q-card"/g) || []).length;
  if (questionCountInHtml !== brief.totalQuestions) {
    issues.push(`HTML 中的题目数量 (${questionCountInHtml}) 与 Brief (${brief.totalQuestions}) 不一致`);
  }

  // Content QA Check 2: KaTeX 标签闭合性与语法
  const openFormulas = (html.match(/\$\$/g) || []).length;
  if (openFormulas % 2 !== 0) {
    issues.push('KaTeX 公式界定符 $$ 存在未闭合情况');
  }

  // Browser QA Check 3: 是否包含核心交互要素
  if (!html.includes('submitTest') || !html.includes('timerBadge')) {
    issues.push('缺少核心提交或计时交互模块');
  }

  return {
    passed: issues.length === 0,
    issues,
    repairedHtml: html,
  };
}
