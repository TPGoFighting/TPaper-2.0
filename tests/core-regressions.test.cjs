const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

require('sucrase/register');

const { generateStandaloneTestHtml } = require('../lib/html-generator.ts');
const { buildHtmlArtifact } = require('../lib/agent/html-builder.ts');
const { callQwenLLM } = require('../lib/llm/client.ts');
const { dynamicPapersStore } = require('../lib/agent/orchestrator.ts');
const { resolvePublishedPaper } = require('../lib/paper-resolver.ts');
const { understandPaperWithLLM } = require('../lib/agent/paper-understanding.ts');

test('LLM client refuses to run without an environment-provided API key', async () => {
  const previousKey = process.env.QWEN_API_KEY;
  delete process.env.QWEN_API_KEY;
  const previousFetch = global.fetch;
  let fetchCalled = false;
  global.fetch = async () => {
    fetchCalled = true;
    throw new Error('fetch should not be called without an API key');
  };

  await assert.rejects(
    callQwenLLM([{ role: 'user', content: 'test' }]),
    /QWEN_API_KEY/
  );
  assert.equal(fetchCalled, false);

  global.fetch = previousFetch;
  if (previousKey === undefined) delete process.env.QWEN_API_KEY;
  else process.env.QWEN_API_KEY = previousKey;
});

test('published-paper resolution returns a dynamically generated paper instead of a sample fallback', () => {
  const paper = {
    id: 'generated-regression-paper',
    title: '动态生成回归试卷',
    subject: '测试',
    grade: '测试',
    durationMinutes: 10,
    totalPoints: 1,
    description: '测试试卷',
    questions: [],
  };
  dynamicPapersStore.set(paper.id, paper);

  assert.equal(resolvePublishedPaper(paper.id), paper);
  dynamicPapersStore.delete(paper.id);
});

test('generated HTML escapes untrusted paper text in markup and event attributes', () => {
  const paper = {
    id: 'html-regression',
    title: '<script>window.xss = 1</script>',
    subject: '测试',
    grade: '测试',
    durationMinutes: 10,
    totalPoints: 1,
    description: '<img src=x onerror=alert(1)>',
    questions: [{
      id: 1,
      type: 'single-choice',
      section: '章节 <b>1</b>',
      question: '<svg onload=alert(2)>',
      options: [{ key: "A');alert(3);//", text: '<b>选项</b>' }],
      correctAnswer: "A');alert(3);//",
      explanation: '<script>alert(4)</script>',
      points: 1,
    }],
  };
  const html = generateStandaloneTestHtml(paper);

  assert.doesNotMatch(html, /<script>window\.xss = 1<\/script>/);
  assert.doesNotMatch(html, /<svg onload=alert\(2\)>/);
  assert.doesNotMatch(html, /onclick="handleSelect\(1, '[^"]*'\);alert\(3\)/);
  assert.match(html, /&lt;script&gt;window\.xss = 1&lt;\/script&gt;/);
});

test('generated HTML renders structured explanations instead of [object Object]', () => {
  const html = generateStandaloneTestHtml({
    id: 'structured-explanation',
    title: '结构化解析测试',
    subject: '测试',
    grade: '测试',
    durationMinutes: 10,
    totalPoints: 5,
    description: '测试试卷',
    questions: [{
      id: 1,
      type: 'long-answer',
      section: '简答题',
      question: '说明原因',
      correctAnswer: '',
      explanation: {
        '考查知识点': '并发控制',
        '详细推导步骤': '先定义互斥信号量，再验证临界区。',
      },
      points: 5,
    }],
  });

  assert.doesNotMatch(html, /\[object Object\]/);
  assert.match(html, /考查知识点：并发控制/);
  assert.match(html, /详细推导步骤：先定义互斥信号量/);
});

test('generated HTML delegates subjective scoring to the grading API', () => {
  const html = generateStandaloneTestHtml({
    id: 'llm-grading',
    title: '大模型评分测试',
    subject: '测试',
    grade: '测试',
    durationMinutes: 10,
    totalPoints: 5,
    description: '测试试卷',
    questions: [{
      id: 1,
      type: 'long-answer',
      section: '简答题',
      question: '说明原因',
      correctAnswer: '应说明两个关键原因',
      explanation: '评分依据：是否覆盖两个关键原因。',
      points: 5,
    }],
  });

  assert.match(html, /gradingEndpoint/);
  assert.match(html, /fetch\(gradingEndpoint/);
  assert.match(html, /评分服务暂时不可用/);
  assert.doesNotMatch(html, /length > 5/);
});

test('generated HTML gives immediate per-question choice feedback and detailed explanations', () => {
  const html = generateStandaloneTestHtml({
    id: 'instant-feedback',
    title: '即时反馈测试',
    subject: '测试',
    grade: '测试',
    durationMinutes: 10,
    totalPoints: 2,
    description: '测试试卷',
    questions: [{
      id: 1,
      type: 'single-choice',
      section: '选择题',
      question: '1+1=?',
      options: [{ key: 'A', text: '2' }, { key: 'B', text: '3' }],
      correctAnswer: 'A',
      explanation: '知识点：基础运算。步骤：将两个 1 相加。结论：答案为 A。',
      points: 2,
    }],
  });

  assert.match(html, /instant-feedback/);
  assert.match(html, /回答正确/);
  assert.match(html, /回答错误/);
  assert.match(html, /expl-1/);
});

test('each question has an independent answer and explanation toggle', () => {
  const html = generateStandaloneTestHtml({
    id: 'answer-toggle',
    title: '答案按钮测试',
    subject: '测试',
    grade: '测试',
    durationMinutes: 10,
    totalPoints: 2,
    description: '测试试卷',
    questions: [{
      id: 1,
      type: 'single-choice',
      section: '选择题',
      question: '1+1=?',
      options: [{ key: 'A', text: '2' }, { key: 'B', text: '3' }],
      correctAnswer: 'A',
      explanation: '详细解析',
      points: 2,
    }],
  });

  assert.match(html, /显示答案 &amp; 解析/);
  assert.match(html, /toggleAnswer\(1\)/);
  assert.match(html, /参考答案<\/span><span[^>]*>A/);
  assert.match(html, /tabbit-logo\.jpg/);
  assert.doesNotMatch(html, /未作答，待人工评分/);
});

test('fill-blank questions render a visible answer line with instant grading, separate from subjective textareas', () => {
  const html = generateStandaloneTestHtml({
    id: 'answer-type-regression',
    title: '填空与主观题分流测试',
    subject: '测试',
    grade: '测试',
    durationMinutes: 10,
    totalPoints: 10,
    description: '测试试卷',
    questions: [
      {
        id: 1,
        type: 'fill-blank',
        section: '填空题',
        question: '操作系统的核心是 。',
        correctAnswer: '程序',
        explanation: '答案是程序。',
        points: 2,
      },
      {
        id: 2,
        type: 'long-answer',
        section: '主观题',
        question: '请说明原因。',
        correctAnswer: '应说明关键原因。',
        explanation: '评分依据。',
        points: 8,
      },
    ],
  });

  assert.match(html, /fill-blank-field/);
  assert.match(html, /fill-correct/);
  assert.match(html, /fill-wrong/);
  assert.match(html, /isFillBlankCorrect\(val, q\.correctAnswer\)/);
  assert.match(html, /<textarea class="input-field textarea-field subjective-field"/);
  assert.doesNotMatch(html, /textarea-field fill-blank-field/);
  assert.match(html, /填空题请输入答案/);
});

test('fill-blank question text keeps a visible blank slot in the prompt', () => {
  const html = generateStandaloneTestHtml({
    id: 'fill-blank-slot',
    title: '题干空位测试',
    subject: '测试',
    grade: '测试',
    durationMinutes: 5,
    totalPoints: 2,
    description: '测试试卷',
    questions: [{
      id: 1,
      type: 'fill-blank',
      section: '填空题',
      question: '操作系统是一组用于管理计算机资源的 。',
      correctAnswer: '程序',
      explanation: '解析',
      points: 2,
    }],
  });

  assert.match(html, /class="q-text fill-blank-question"/);
  assert.match(html, /\.blank-slot \{[\s\S]*border-bottom: 3px solid var\(--ink\)/);
  assert.doesNotMatch(html, /class="blank-slot"[^>]*>________<\/span>/);
  assert.match(html, /管理计算机资源的<span class="blank-slot"/);
});

test('uploaded-paper pipeline uses the same HTML renderer as direct paper viewing', async () => {
  const paper = {
    id: 'upload-renderer-regression',
    title: '上传链路一致性测试',
    subject: '测试',
    grade: '测试',
    durationMinutes: 5,
    totalPoints: 2,
    description: '测试试卷',
    questions: [{
      id: 1,
      type: 'fill-blank',
      section: '填空题',
      question: '核心是 。',
      correctAnswer: '程序',
      explanation: '解析',
      points: 2,
    }],
  };
  const brief = {
    title: paper.title,
    subject: paper.subject,
    grade: paper.grade,
    estimatedDuration: paper.durationMinutes,
    totalPoints: paper.totalPoints,
    totalQuestions: paper.questions.length,
    sections: [],
    hasMathFormulas: false,
    hasImages: false,
    specialNotes: [],
  };
  const plan = {
    style: 'minimal-academic',
    layout: { desktop: 'single column', mobile: 'single column' },
    navigation: 'top-progress',
    interactions: [],
    scoringMode: 'instant-auto',
    explanationMode: 'immediate-reveal',
  };

  const uploadedHtml = await buildHtmlArtifact(brief, plan, paper);
  const directHtml = generateStandaloneTestHtml(paper);
  assert.equal(uploadedHtml, directHtml);
});

test('paper understanding prompts require detailed model-generated explanations', () => {
  const source = fs.readFileSync(
    require.resolve('../lib/agent/paper-understanding.ts'),
    'utf8'
  );

  assert.match(source, /常见错误/);
  assert.match(source, /逐步推理/);
  assert.match(source, /结论/);
});

test('subjective grading endpoint returns a validated model score', async () => {
  const previousKey = process.env.QWEN_API_KEY;
  const previousFetch = global.fetch;
  process.env.QWEN_API_KEY = 'local-test-key';
  let requestBody;
  global.fetch = async (_url, init) => {
    requestBody = JSON.parse(init.body);
    return {
      ok: true,
      async json() {
        return {
          choices: [{ message: { content: JSON.stringify({
            score: 4,
            feedback: '覆盖了主要步骤，但缺少边界条件。',
            strengths: ['核心概念正确'],
            missingPoints: ['缺少边界条件'],
            confidence: 'high',
          }) } }],
        };
      },
    };
  };

  try {
    const { POST } = require('../app/api/papers/grade/route.ts');
    const response = await POST(new Request('http://localhost/api/papers/grade', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        question: '说明死锁的必要条件。',
        answer: '互斥、请求与保持、不可抢占、循环等待。',
        referenceAnswer: '应列出四个必要条件。',
        points: 5,
      }),
    }));
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.grade.score, 4);
    assert.match(requestBody.messages[1].content, /死锁的必要条件/);
  } finally {
    global.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.QWEN_API_KEY;
    else process.env.QWEN_API_KEY = previousKey;
  }
});

test('polling timeout cannot mark an unfinished job as ready', () => {
  const source = fs.readFileSync(
    require.resolve('../components/InteractiveDropzone.tsx'),
    'utf8'
  );

  assert.doesNotMatch(source, /if \(step !== 'ready'\)[\s\S]*setStep\('ready'\)/);
  assert.match(source, /生成任务处理超时/);
});

test('unreadable uploads fail instead of silently becoming the calculus sample', async () => {
  await assert.rejects(
    understandPaperWithLLM({
      filename: 'unknown-scan.png',
      sourceType: 'image',
      fileSizeBytes: 100,
      extractedText: '',
      pages: [],
      metadata: {},
    }),
    /无法从文档中提取可用试卷内容/
  );
});

test('scanned pages are sent to the vision model for OCR extraction', async () => {
  const previousKey = process.env.QWEN_API_KEY;
  const previousFetch = global.fetch;
  process.env.QWEN_API_KEY = 'local-test-key';
  let sentImage = false;
  global.fetch = async (_url, init) => {
    const body = JSON.parse(init.body);
    const content = body.messages?.find((message) => Array.isArray(message.content))?.content || [];
    sentImage = content.some((item) => item.type === 'image_url');
    return {
      ok: true,
      async json() {
        return {
          choices: [{ message: { content: JSON.stringify({
            id: 'ocr-regression',
            title: '扫描件回归试卷',
            subject: '测试',
            grade: '测试',
            durationMinutes: 10,
            totalPoints: 1,
            description: 'OCR test',
            questions: [{
              id: 1,
              type: 'single-choice',
              question: '扫描题目',
              options: [{ key: 'A', text: '答案' }],
              correctAnswer: 'A',
              explanation: '解析',
              points: 1,
            }],
          }) } }],
        };
      },
    };
  };

  const { understandPaperWithLLM } = require('../lib/agent/paper-understanding.ts');
  const result = await understandPaperWithLLM({
    filename: 'scan.pdf',
    sourceType: 'pdf',
    fileSizeBytes: 100,
    extractedText: '',
    pages: [{ pageNumber: 1, text: '', imageUrl: 'data:image/png;base64,ZmFrZQ==' }],
    metadata: { isScanned: true, extractionStatus: 'ocr-required' },
  });

  assert.equal(sentImage, true);
  assert.equal(result.structuredPaper.title, '扫描件回归试卷');

  global.fetch = previousFetch;
  if (previousKey === undefined) delete process.env.QWEN_API_KEY;
  else process.env.QWEN_API_KEY = previousKey;
});
