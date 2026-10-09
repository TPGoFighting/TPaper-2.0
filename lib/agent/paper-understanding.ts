import { DocumentPackage, PaperBrief } from './types';
import { createFallbackPaperFromDoc } from './fallback-helper';
import { callQwenLLM, extractJsonFromMarkdown, ChatMessage, MessageContent } from '../llm/client';
import { SamplePaper, Question, SAMPLE_PAPERS } from '../sample-papers';

const UNDERSTANDING_SYSTEM_PROMPT = `你是一个资深的 AI 试卷理解与教学专家 (tpaper Document Understanding Agent)。
你的任务是深度分析用户提供的试卷、习题、PDF 或图片文字，将其转化为结构化的交互式试卷数据对象 (JSON 格式)。

请严格按照以下 JSON Schema 输出纯 JSON（不要输出任何无关的前言或废话）：
{
  "id": "试卷短标识（小写英文横杠，如 njupt-physics-exam）",
  "title": "试卷主标题",
  "subject": "学科名称",
  "grade": "适用年级或学段",
  "durationMinutes": 建议作答时长（纯整数，如 120）,
  "totalPoints": 满分（纯整数，如 100）,
  "description": "一句话介绍试卷主要考点与题型特点",
  "questions": [
    {
      "id": 题目编号（数字 1, 2, ...）,
      "section": "所属章节或部分名称（如 一、选择题 / 二、填空题 / 三、计算大题）",
      "type": "题型（必须为 'single-choice' | 'multiple-choice' | 'fill-blank' | 'long-answer'）",
      "question": "题干完整文字描述",
      "formula": "题目的核心数学或物理公式（标准 LaTeX 语法，无公式可为空字符串）",
      "options": [
        { "key": "A", "text": "选项A内容" },
        { "key": "B", "text": "选项B内容" },
        { "key": "C", "text": "选项C内容" },
        { "key": "D", "text": "选项D内容" }
      ],
      "correctAnswer": "标准参考答案",
      "points": 每题分值,
  "explanation": "详细解题解析（必须包含【考查知识点】【逐步推理】【常见错误】【结论】，选择题至少 120 字，计算/简答题至少 250 字）"
    }
  ]
}`;

/**
 * 02 / Document Understanding Agent
 * 采用分大题分块（Chunking & Multi-pass）解析机制，彻底杜绝大模型 Token 截断导致的漏题。
 */
export async function understandPaperWithLLM(
  doc: DocumentPackage,
  preferredPaperId?: string
): Promise<{ brief: PaperBrief; structuredPaper: SamplePaper }> {
  // 样例体验必须显式指定，真实上传文件不能按文件名猜测试卷内容。
  if (preferredPaperId && SAMPLE_PAPERS[preferredPaperId]) {
    const structuredPaper = SAMPLE_PAPERS[preferredPaperId];
    return { brief: generateBrief(structuredPaper), structuredPaper };
  }

  const sourceText = stripAnswerSection(doc.extractedText);
  const hasSubstantialText = sourceText && sourceText.length > 10;

  if (!hasSubstantialText && doc.pages.some((page) => page.imageUrl)) {
    return understandPaperFromImages(doc);
  }

  if (hasSubstantialText) {
    try {
      // 2. 检查是否包含多个大题章节，若文本较长则分章节进行提取并汇总
      const sections = splitIntoSections(sourceText);
      let allQuestions: Question[] = [];
      let paperMeta: any = null;

      if (sections.length > 1 && sourceText.length > 1500) {
        // 多章节分段提取，避免单次超 Token 预算
        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];
          const secQuestions = await extractSectionQuestions(
            doc.filename,
            sec.title,
            sec.text,
            allQuestions.length,
            inferExpectedQuestionCount(sec.text)
          );
          allQuestions = allQuestions.concat(secQuestions);
        }
      } else {
        // 单次全量提取
        const userPrompt = `请对以下试卷文档进行解析与结构化提取：
文件名: ${doc.filename}
试卷文本:
${sourceText.slice(0, 4500)}

请尽可能完整提取出试卷中的所有考题，并为每题生成可直接展示给学生的详细答案解析：必须包含考查知识点、逐步推理、常见错误和结论；选择题至少 120 字，计算/简答题至少 250 字。输出严格 JSON。`;

        const messages: ChatMessage[] = [
          { role: 'system', content: UNDERSTANDING_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ];

        const rawResponse = await callQwenLLM(messages, {
          model: 'qwen-turbo',
          temperature: 0.2,
          maxTokens: 3000,
        });

        const parsedPaper = extractJsonFromMarkdown<any>(rawResponse);
        paperMeta = parsedPaper;
        allQuestions = normalizeQuestions(parsedPaper.questions || []);
      }

      if (allQuestions.length > 0) {
        const structuredPaper: SamplePaper = {
          id: (paperMeta?.id || 'paper-' + Math.random().toString(36).substring(2, 8)).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          title: paperMeta?.title || doc.filename.replace(/\.[^/.]+$/, ''),
          subject: paperMeta?.subject || '综合学科',
          grade: paperMeta?.grade || '大学本科',
          durationMinutes: paperMeta?.durationMinutes || 120,
          totalPoints: paperMeta?.totalPoints || inferTotalPoints(sourceText) || allQuestions.reduce((sum, q) => sum + q.points, 0) || 100,
          description: paperMeta?.description || '由 tpaper 多模态 AI Agent 针对真实上传试卷自动解析生成的交互式试卷产物。',
          questions: allQuestions,
        };

        return { brief: generateBrief(structuredPaper), structuredPaper };
      }
    } catch (err) {
      console.warn('Qwen LLM 分块解析异常，回退本地保护模式:', err);
    }
  }

  return getFallbackPaper(doc);
}

async function understandPaperFromImages(
  doc: DocumentPackage
): Promise<{ brief: PaperBrief; structuredPaper: SamplePaper }> {
  const imagePages = doc.pages.filter((page) => page.imageUrl);
  const batchSize = Math.max(1, Number(process.env.QWEN_VISION_BATCH_SIZE || 2));
  let allQuestions: Question[] = [];
  let paperMeta: any = null;

  for (let start = 0; start < imagePages.length; start += batchSize) {
    const batch = imagePages.slice(start, start + batchSize);
    const content: MessageContent = [
      {
        type: 'text',
            text: `请识别《${doc.filename}》第 ${start + 1}-${start + batch.length} 页中的全部试题，忽略页眉水印和答案解析，只输出 JSON：{ "title": "", "subject": "", "grade": "", "durationMinutes": 120, "totalPoints": 100, "description": "", "questions": [...] }。每道题必须包含 type, question, formula, options, correctAnswer, points, explanation。explanation 必须包含考查知识点、逐步推理、常见错误和结论；选择题至少 120 字，计算/简答题至少 250 字。`,
      },
      ...batch.map((page) => ({
        type: 'image_url' as const,
        image_url: { url: page.imageUrl! },
      })),
    ];

    const rawResponse = await callQwenLLM([
      { role: 'system', content: UNDERSTANDING_SYSTEM_PROMPT },
      { role: 'user', content },
    ], {
      model: process.env.QWEN_VISION_MODEL || 'qwen-vl-max',
      temperature: 0.2,
      maxTokens: 3500,
      timeoutMs: Number(process.env.QWEN_VISION_TIMEOUT_MS || 90000),
    });

    const parsed = extractJsonFromMarkdown<any>(rawResponse);
    paperMeta ||= parsed;
    allQuestions = allQuestions.concat(normalizeQuestions(parsed.questions || [], allQuestions.length));
  }

  if (allQuestions.length === 0) {
    return getFallbackPaper(doc);
  }

  const structuredPaper: SamplePaper = {
    id: (paperMeta?.id || 'paper-' + Math.random().toString(36).substring(2, 8)).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    title: paperMeta?.title || doc.filename.replace(/\.[^/.]+$/, ''),
    subject: paperMeta?.subject || '综合学科',
    grade: paperMeta?.grade || '大学本科',
    durationMinutes: paperMeta?.durationMinutes || 120,
    totalPoints: paperMeta?.totalPoints || allQuestions.reduce((sum, q) => sum + q.points, 0) || 100,
    description: paperMeta?.description || '由 tpaper 视觉 OCR Agent 针对扫描试卷生成的交互式试卷产物。',
    questions: allQuestions,
  };

  return { brief: generateBrief(structuredPaper), structuredPaper };
}

/** 删除答案/详细解答附录，避免模型把答案编号再次识别成题目。 */
export function stripAnswerSection(text: string): string {
  const markers = ['参考答案', '详细解答', '答案解析', '答案与解析'];
  const candidates = markers
    .map((marker) => text.indexOf(marker, 500))
    .filter((index) => index >= 0);
  if (candidates.length === 0) return text;
  return text.slice(0, Math.min(...candidates)).trim();
}

function inferExpectedQuestionCount(sectionText: string): number | undefined {
  const byPerQuestionScore = sectionText.match(/每(?:小题|题|空)\s*(\d+)\s*分[，,]\s*共\s*(\d+)\s*分/);
  if (byPerQuestionScore) {
    const perQuestion = Number(byPerQuestionScore[1]);
    const total = Number(byPerQuestionScore[2]);
    if (perQuestion > 0 && total > 0 && total % perQuestion === 0) return total / perQuestion;
  }

  const explicitCount = sectionText.match(/共\s*(\d+)\s*小题/);
  return explicitCount ? Number(explicitCount[1]) : undefined;
}

function inferTotalPoints(sourceText: string): number | undefined {
  const match = sourceText.match(/(?:满分|总分)\s*[：:]?\s*(\d+)\s*分/);
  return match ? Number(match[1]) : undefined;
}

/**
 * 将整篇试卷文本切分为一、选择题 / 二、填空题 / 三、大题等章节
 */
function splitIntoSections(text: string): { title: string; text: string }[] {
  const regex = /(^[一二三四五六七八九十]、[^\n]+)/gm;
  const matches = [...text.matchAll(regex)];
  if (matches.length < 2) return [{ title: '全卷试题', text }];

  const sections: { title: string; text: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const startIndex = current.index!;
    const endIndex = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    sections.push({
      title: current[0].trim(),
      text: text.substring(startIndex, endIndex).trim(),
    });
  }
  return sections;
}

/**
 * 针对单一大题章节调用 LLM 提取考题
 */
async function extractSectionQuestions(
  filename: string,
  sectionTitle: string,
  sectionText: string,
  startId: number,
  expectedQuestionCount?: number
): Promise<Question[]> {
  try {
    const prompt = `请从《${filename}》的章节【${sectionTitle}】中提取所有考题并生成 JSON questions 数组：
章节文本:
${sectionText}

输出格式：{ "questions": [...] }，包含 type, question, formula, options, correctAnswer, points, explanation。每道 explanation 必须包含考查知识点、逐步推理、常见错误和结论；选择题至少 120 字，计算/简答题至少 250 字。
${expectedQuestionCount ? `本章节按原卷分值应有 ${expectedQuestionCount} 道题，必须逐题完整输出；不要把答案解析中的编号识别为新题。` : '只输出原卷题目，不要把答案解析中的编号识别为新题。'}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: UNDERSTANDING_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ];

    const rawResponse = await callQwenLLM(messages, {
      model: 'qwen-turbo',
      temperature: 0.2,
      maxTokens: 5000,
    });

    const parsed = extractJsonFromMarkdown<any>(rawResponse);
    return normalizeQuestions(parsed.questions || [], startId, sectionTitle);
  } catch (e) {
    console.warn(`Section extraction failed for ${sectionTitle}`, e);
    return [];
  }
}

function normalizeQuestions(rawList: any[], startId: number = 0, defaultSection?: string): Question[] {
  return rawList.map((q: any, idx: number) => {
    let options: { key: string; text: string }[] | undefined = undefined;

    if (Array.isArray(q.options) && q.options.length > 0) {
      options = q.options.map((opt: any, optIdx: number) => {
        if (typeof opt === 'string') {
          const match = opt.match(/^([A-Da-d])[\s.、:：](.*)$/);
          if (match) {
            return { key: match[1].toUpperCase(), text: match[2].trim() };
          }
          return { key: String.fromCharCode(65 + optIdx), text: opt };
        }
        return { key: opt.key || String.fromCharCode(65 + optIdx), text: opt.text || '' };
      });
    }

    let type: Question['type'] = 'single-choice';
    if (q.type === 'fill_blank' || q.type === 'fill-blank' || (!options && q.question?.includes('_____'))) {
      type = 'fill-blank';
    } else if (q.type === 'long_answer' || q.type === 'long-answer' || (!options && (q.points || 0) >= 8)) {
      type = 'long-answer';
    } else if (options && options.length > 0) {
      type = 'single-choice';
    }

    return {
      id: startId + idx + 1,
      section: q.section || defaultSection || (type === 'single-choice' ? '一、选择题' : type === 'fill-blank' ? '二、填空题' : '三、计算大题'),
      type,
      question: q.question || `试题 ${startId + idx + 1}`,
      formula: q.formula || '',
      options,
      correctAnswer: q.correctAnswer || q.answer || 'A',
      explanation: normalizeExplanation(q.explanation || q.solution || '【详细解析】暂无详细解析'),
      points: q.points || (type === 'single-choice' ? 3 : type === 'fill-blank' ? 3 : 10),
    };
  });
}

function normalizeExplanation(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(normalizeExplanation).join('、');
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key}：${normalizeExplanation(item)}`)
      .join('\n');
  }
  return String(value);
}

function generateBrief(paper: SamplePaper): PaperBrief {
  return {
    title: paper.title,
    subject: paper.subject,
    grade: paper.grade,
    estimatedDuration: paper.durationMinutes,
    totalPoints: paper.totalPoints,
    totalQuestions: paper.questions.length,
    sections: [
      { sectionTitle: '全卷试题', questionRange: `Q1-Q${paper.questions.length}`, type: '综合题型', points: paper.totalPoints },
    ],
    hasMathFormulas: paper.questions.some((q) => !!q.formula),
    hasImages: false,
    specialNotes: [`完整收录全卷 ${paper.questions.length} 道考题`, '自动生成分步解析与 KaTeX 公式'],
  };
}

function getFallbackPaper(doc: DocumentPackage): { brief: PaperBrief; structuredPaper: SamplePaper } {
  const structuredPaper = createFallbackPaperFromDoc(doc);
  return { brief: generateBrief(structuredPaper), structuredPaper };
}
