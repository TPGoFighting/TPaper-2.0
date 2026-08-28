import { SamplePaper } from './sample-papers';

export function stringifyRenderableText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(stringifyRenderableText).join('、');
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key}：${stringifyRenderableText(item)}`)
      .join('\n');
  }
  return String(value);
}

function escapeHtml(value: unknown): string {
  return stringifyRenderableText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsString(value: unknown): string {
  return JSON.stringify(stringifyRenderableText(value)).replace(/</g, '\\u003c');
}

const FILL_BLANK_TOKEN = '__TPAPER_FILL_BLANK__';

function renderQuestionHtml(question: unknown, type: string): string {
  const text = stringifyRenderableText(question);
  if (type !== 'fill-blank') return escapeHtml(text);

  let markedText = text
    .replace(/_{2,}|＿{2,}|（\s*）|\(\s*\)|【\s*】/g, FILL_BLANK_TOKEN)
    .replace(/([\u4e00-\u9fff、，；：])\s+(?=[\u4e00-\u9fff])/g, `$1${FILL_BLANK_TOKEN}`)
    .replace(/([\u4e00-\u9fff])\s+(?=[。！？；：，、.!?])/g, `$1${FILL_BLANK_TOKEN}`);

  if (!markedText.includes(FILL_BLANK_TOKEN)) {
    markedText = `${markedText.trimEnd()} ${FILL_BLANK_TOKEN}`;
  }

  return escapeHtml(markedText).replaceAll(
    FILL_BLANK_TOKEN,
    '<span class="blank-slot" aria-label="填空位置"></span>'
  );
}

export interface StandaloneHtmlOptions {
  gradingEndpoint?: string;
  parentOrigin?: string;
  logoSrc?: string;
}

/**
 * 生成完全自包含的交互式单文件 HTML 试卷产物（HTML Artifact）
 * 内置 KaTeX 公式渲染、响应式布局、大题与简答题适配、倒计时、即时评分、详细解析与 postMessage 通信支持。
 */
export function generateStandaloneTestHtml(paper: SamplePaper, options: StandaloneHtmlOptions = {}): string {
  const safeJson = JSON.stringify(paper).replace(/</g, '\\u003c');
  const title = escapeHtml(paper.title);
  const description = escapeHtml(paper.description);
  const gradingEndpoint = JSON.stringify(options.gradingEndpoint || process.env.NEXT_PUBLIC_TPAPER_GRADE_ENDPOINT || '/api/papers/grade').replace(/</g, '\\u003c');
  const parentOrigin = JSON.stringify(options.parentOrigin || '').replace(/</g, '\\u003c');
  const logoSrc = escapeHtml(options.logoSrc || '/tabbit-logo.jpg');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — tpaper 交互式试卷</title>
  <!-- KaTeX 公式库与平滑回退 -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" crossorigin="anonymous">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js" crossorigin="anonymous"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js" crossorigin="anonymous"></script>
  <style>
    :root {
      --bg: #FAF7F1;
      --card-bg: #FFFFFF;
      --ink: #0F1115;
      --slate: #6B7280;
      --mist: #E7E7EA;
      --orange: #FF9D1A;
      --lime: #A6E22E;
      --correct: #10B981;
      --wrong: #EF4444;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      min-height: 100%;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", Roboto, sans-serif;
      background-color: var(--bg);
      background-image: 
        linear-gradient(to right, rgba(15, 17, 21, 0.045) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(15, 17, 21, 0.045) 1px, transparent 1px);
      background-size: 24px 24px;
      color: var(--ink);
      line-height: 1.6;
      padding-bottom: 80px;
    }
    .header {
      background: #FFFFFF;
      border-bottom: 2px solid var(--ink);
      padding: 16px 24px;
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 0 rgba(15, 17, 21, 0.06);
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .tp-logo {
      width: 36px;
      height: 36px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid var(--ink);
      background: var(--ink);
      flex: 0 0 auto;
    }
    .header-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--ink);
      max-width: 500px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .timer-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: #FFFFFF;
      border: 1.5px solid var(--ink);
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      font-family: monospace;
      box-shadow: 2px 2px 0 var(--ink);
    }
    .main-container {
      max-width: 860px;
      margin: 32px auto;
      padding: 0 20px;
    }
    .paper-intro {
      background: #FFFFFF;
      border: 2px solid var(--ink);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 4px 4px 0 var(--ink);
      margin-bottom: 28px;
    }
    .intro-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    .pill {
      background: var(--mist);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid rgba(15, 17, 21, 0.15);
    }
    .pill-orange {
      background: #FFF4E5;
      color: #D97706;
      border-color: var(--orange);
    }
    .q-card {
      background: #FFFFFF;
      border: 2px solid var(--ink);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 4px 4px 0 var(--ink);
      margin-bottom: 24px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .q-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .q-number {
      font-size: 13px;
      font-weight: 800;
      background: var(--ink);
      color: #FFFFFF;
      padding: 2px 8px;
      border-radius: 6px;
    }
    .q-section {
      font-size: 12px;
      color: var(--slate);
      font-weight: 700;
    }
    .q-text {
      font-size: 16px;
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 14px;
      white-space: pre-wrap;
    }
    .fill-blank-question {
      line-height: 2;
    }
    .blank-slot {
      display: inline-block;
      min-width: 96px;
      padding: 0 8px 1px;
      margin: 0 4px;
      border-bottom: 3px solid var(--ink);
      line-height: 1;
      vertical-align: baseline;
    }
    .formula-box {
      background: #FAF7F1;
      border: 1.5px dashed var(--ink);
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 18px;
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      font-family: "KaTeX_Math", "Times New Roman", monospace, serif;
      overflow-x: auto;
    }
    .options-grid {
      display: grid;
      gap: 10px;
    }
    .option-label {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border: 1.5px solid var(--ink);
      border-radius: 10px;
      background: #FFFFFF;
      cursor: pointer;
      font-weight: 600;
      user-select: none;
      transition: all 0.15s ease;
    }
    .option-label:hover {
      background: #FFF9F0;
      transform: translateX(2px);
    }
    .option-label.selected {
      background: #FFF4E5;
      border-color: var(--orange);
      box-shadow: 2px 2px 0 var(--orange);
    }
    .option-label.correct-reveal {
      background: #E8FBF0;
      border-color: var(--correct);
      color: #065F46;
      font-weight: 800;
    }
    .option-label.wrong-reveal {
      background: #FEE2E2;
      border-color: var(--wrong);
      color: #991B1B;
    }
    .option-input {
      width: 1rem;
      height: 1rem;
      margin-top: 3px;
      accent-color: var(--orange);
      flex: 0 0 auto;
    }
    .input-field {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid var(--ink);
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      outline: none;
      background: #FAF7F1;
      font-family: inherit;
    }
    .input-field:focus {
      background: #FFFFFF;
      box-shadow: 3px 3px 0 var(--orange);
      border-color: var(--orange);
    }
    .textarea-field {
      min-height: 110px;
      resize: vertical;
    }
    .subjective-field {
      min-height: 140px;
    }
    .fill-blank-answer-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 4px;
    }
    .fill-blank-label {
      color: var(--slate);
      font-size: 14px;
      font-weight: 800;
      white-space: nowrap;
    }
    .fill-blank-field {
      width: min(100%, 440px);
      min-width: 180px;
      padding: 8px 6px 6px;
      border: 0;
      border-bottom: 3px solid var(--ink);
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }
    .fill-blank-field:focus {
      background: #FFFDF8;
      border-color: var(--orange);
      border-bottom-color: var(--orange);
      box-shadow: none;
    }
    .fill-blank-field.fill-correct {
      background: #E8FBF0;
      border-bottom-color: var(--correct);
      color: #065F46;
    }
    .fill-blank-field.fill-wrong {
      background: #FEE2E2;
      border-bottom-color: var(--wrong);
      color: #991B1B;
    }
    .fill-blank-field:disabled {
      opacity: 1;
    }
    .explanation-drawer {
      margin-top: 16px;
      padding: 18px;
      border-radius: 10px;
      background: #F8FAFC;
      border: 1.5px solid #CBD5E1;
      display: none;
      white-space: pre-wrap;
      line-height: 1.7;
    }
    .explanation-drawer.visible {
      display: block;
    }
    .explanation-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--ink);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .grading-status {
      margin-top: 10px;
      color: var(--slate);
      font-size: 13px;
      font-weight: 700;
    }
    .grading-status.pending {
      color: #B45309;
    }
    .grading-status.success {
      color: #047857;
    }
    .grading-status.error {
      color: #B91C1C;
    }
    .instant-feedback {
      display: none;
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 800;
      line-height: 1.6;
    }
    .instant-feedback.visible { display: block; }
    .instant-feedback.correct {
      background: #E8FBF0;
      color: #047857;
      border: 1px solid #10B981;
    }
    .instant-feedback.wrong {
      background: #FEE2E2;
      color: #B91C1C;
      border: 1px solid #EF4444;
    }
    .answer-toggle {
      margin-top: 14px;
      border: 1.5px solid var(--ink);
      border-radius: 8px;
      background: #FFFFFF;
      color: var(--ink);
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 2px 2px 0 var(--ink);
    }
    .answer-toggle:hover { background: #FFF4E5; }
    .answer-toggle[aria-expanded="true"] { background: #FFF4E5; }
    .answer-line {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      padding: 10px 12px;
      margin-bottom: 12px;
      border-radius: 8px;
      background: #FFF4E5;
      border-left: 4px solid var(--orange);
      font-weight: 800;
    }
    .answer-label { color: #B45309; white-space: nowrap; }
    .submit-bar {
      margin-top: 32px;
      text-align: center;
    }
    .btn-submit {
      background: var(--ink);
      color: #FFFFFF;
      font-size: 16px;
      font-weight: 800;
      padding: 16px 36px;
      border: 2px solid var(--ink);
      border-radius: 12px;
      box-shadow: 4px 4px 0 var(--orange);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-submit:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0 var(--orange);
    }
    .score-banner {
      display: none;
      background: #FFFFFF;
      border: 2px solid var(--ink);
      border-radius: 16px;
      padding: 28px;
      box-shadow: 6px 6px 0 var(--lime);
      text-align: center;
      margin-bottom: 28px;
    }
    .score-value {
      font-size: 54px;
      font-weight: 900;
      color: var(--ink);
      line-height: 1;
      margin: 12px 0;
    }
    @media (max-width: 640px) {
      .header { padding: 12px 14px; }
      .header-title { max-width: 46vw; font-size: 14px; }
      .timer-badge { padding: 5px 9px; font-size: 12px; }
      .main-container { margin: 20px auto; padding: 0 12px; }
      .paper-intro, .q-card { padding: 16px; border-radius: 12px; }
      .q-header { align-items: flex-start; gap: 8px; }
      .q-section { text-align: right; }
      .score-value { font-size: 42px; }
    }
    @media print {
      .header { position: static; box-shadow: none; }
      .submit-bar, .timer-badge { display: none; }
      .q-card, .paper-intro { break-inside: avoid; box-shadow: none; }
    }
  </style>
</head>
<body>

  <header class="header">
    <div class="header-brand">
      <img class="tp-logo" src="${logoSrc}" alt="Tabbit logo">
      <span class="header-title">${title}</span>
    </div>
    <div class="timer-badge" id="timerBadge">
      ⏱️ <span id="timerText">00:00</span>
    </div>
  </header>

  <main class="main-container">
    <div class="score-banner" id="scoreBanner">
      <h2>🎉 试卷提交成功！</h2>
      <div class="score-value" id="scoreDisplay">0 / 100</div>
      <p id="scoreSummary" style="color: var(--slate); font-weight: 600;"></p>
    </div>

    <div class="paper-intro">
      <h1 style="font-size: 22px; font-weight: 800; margin-bottom: 8px;">${title}</h1>
      <p style="color: var(--slate); font-size: 14px;">${description}</p>
      <div class="intro-meta">
        <span class="pill pill-orange">⚡ 由 tpaper 自动生成为交互式 HTML 产物</span>
        <span class="pill">⏱️ 建议限时：${paper.durationMinutes} 分钟</span>
        <span class="pill">🎯 满分：${paper.totalPoints} 分</span>
        <span class="pill">📝 全卷共 ${paper.questions.length} 题</span>
      </div>
    </div>

    <form id="testForm">
      ${paper.questions.map((q, idx) => `
        <div class="q-card" id="card-${q.id}">
          <div class="q-header">
            <span class="q-number">第 ${idx + 1} 题</span>
            <span class="q-section">${escapeHtml(q.section)} (${q.points} 分)</span>
          </div>
          <div class="q-text${q.type === 'fill-blank' ? ' fill-blank-question' : ''}">${renderQuestionHtml(q.question, q.type)}</div>
          ${q.formula ? `<div class="formula-box">$$${escapeHtml(q.formula)}$$</div>` : ''}
          
          ${q.type === 'single-choice' && q.options ? `
            <div class="options-grid" role="radiogroup" aria-label="第 ${idx + 1} 题选项">
              ${q.options.map(opt => `
                <label class="option-label" id="label-${q.id}-${escapeHtml(opt.key)}">
                  <input class="option-input" type="radio" name="q_${q.id}" value="${escapeHtml(opt.key)}" onchange="handleSelect(${q.id}, ${escapeHtml(escapeJsString(opt.key))})">
                  <span style="font-weight: 800; color: var(--slate);">${escapeHtml(opt.key)}.</span>
                  <span>${escapeHtml(opt.text)}</span>
                </label>
              `).join('')}
            </div>
          ` : q.type === 'long-answer' ? `
            <textarea class="input-field textarea-field subjective-field" name="q_${q.id}" id="input-${q.id}" placeholder="请输入解题要点、公式推导或伪代码..." oninput="handleInput(${q.id}, this.value)"></textarea>
          ` : q.type === 'fill-blank' ? `
            <div class="fill-blank-answer-row">
              <span class="fill-blank-label">答案</span>
              <input type="text" class="input-field fill-blank-field" name="q_${q.id}" id="input-${q.id}" aria-label="第 ${idx + 1} 题填空题请输入答案" placeholder="填空题请输入答案" oninput="handleInput(${q.id}, this.value)">
            </div>
          ` : `
            <input type="text" class="input-field" name="q_${q.id}" id="input-${q.id}" placeholder="请输入答案..." oninput="handleInput(${q.id}, this.value)">
          `}

          <div class="instant-feedback" id="instant-feedback-${q.id}" aria-live="polite"></div>
          <button type="button" class="answer-toggle" id="answer-toggle-${q.id}" onclick="toggleAnswer(${q.id})" aria-expanded="false">
            显示答案 &amp; 解析
          </button>
          <div class="explanation-drawer" id="expl-${q.id}">
            <div class="explanation-title">💡 官方参考答案与深度分步解析</div>
            <div class="answer-line"><span class="answer-label">参考答案</span><span id="answer-${q.id}">${escapeHtml(q.correctAnswer)}</span></div>
            <div style="font-size: 14px; color: var(--ink); white-space: pre-wrap;" id="expl-text-${q.id}">${escapeHtml(q.explanation)}</div>
          </div>
          ${q.type === 'long-answer' ? `<div class="grading-status" id="grade-status-${q.id}" aria-live="polite">提交后由大模型按参考答案评分</div>` : ''}
        </div>
      `).join('')}

      <div class="submit-bar">
        <button type="button" class="btn-submit" id="submitBtn" onclick="submitTest()">
          提交试卷并计算得分 →
        </button>
      </div>
    </form>
  </main>

  <!-- 嵌入安全的结构化试卷数据 -->
  <script id="tpaper-data" type="application/json">
${safeJson}
  </script>

  <script>
    let paperData;
    try {
      paperData = JSON.parse(document.getElementById('tpaper-data').textContent);
    } catch(e) {
      console.error('Failed to parse paper data', e);
    }

    const answers = {};
    let secondsElapsed = 0;
    let timerInterval = null;
    let submitted = false;
    const gradingEndpoint = ${gradingEndpoint};
    const parentOrigin = ${parentOrigin};

    // 触发 KaTeX 自动渲染
    function triggerKaTeX() {
      if (window.renderMathInElement) {
        try {
          window.renderMathInElement(document.body, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '\\\\(', right: '\\\\)', display: false }
            ],
            throwOnError: false
          });
        } catch (e) {
          console.warn('KaTeX notice', e);
        }
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', triggerKaTeX);
    } else {
      triggerKaTeX();
    }
    window.addEventListener('load', () => {
      triggerKaTeX();
      setTimeout(triggerKaTeX, 500);
    });

    // 启动答题计时器
    timerInterval = setInterval(() => {
      if (submitted) return;
      secondsElapsed++;
      const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
      const secs = String(secondsElapsed % 60).padStart(2, '0');
      const timerEl = document.getElementById('timerText');
      if (timerEl) {
        timerEl.innerText = mins + ':' + secs;
      }
    }, 1000);

    function handleSelect(qid, optKey) {
      if (submitted) return;
      answers[qid] = optKey;
      if (paperData && paperData.questions) {
        const q = paperData.questions.find(item => item.id === qid);
        if (q && q.options) {
          const isCorrect = String(optKey).trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase();
          q.options.forEach(opt => {
            const el = document.getElementById('label-' + qid + '-' + opt.key);
            if (el) {
              el.classList.remove('selected', 'correct-reveal', 'wrong-reveal');
              if (opt.key === optKey) el.classList.add(isCorrect ? 'correct-reveal' : 'wrong-reveal');
              if (!isCorrect && opt.key === q.correctAnswer) el.classList.add('correct-reveal');
            }
          });

          const feedback = document.getElementById('instant-feedback-' + qid);
          if (feedback) {
            feedback.className = 'instant-feedback visible ' + (isCorrect ? 'correct' : 'wrong');
            feedback.textContent = isCorrect
              ? '✓ 回答正确！点击下方按钮查看详细解析。'
              : '✗ 回答错误。正确答案：' + q.correctAnswer + '。点击下方按钮查看详细解析。';
          }
        }
      }
      notifyParentProgress();
    }

    function handleInput(qid, val) {
      if (submitted) return;
      const answer = val.trim();
      answers[qid] = answer;
      const q = paperData && paperData.questions ? paperData.questions.find(item => item.id === qid) : null;
      if (q && q.type === 'fill-blank') {
        const input = document.getElementById('input-' + qid);
        const feedback = document.getElementById('instant-feedback-' + qid);
        const hasAnswer = answer.length > 0;
        const isCorrect = hasAnswer && isFillBlankCorrect(val, q.correctAnswer);
        if (input) {
          input.classList.toggle('fill-correct', isCorrect);
          input.classList.toggle('fill-wrong', hasAnswer && !isCorrect);
          input.setAttribute('aria-invalid', hasAnswer && !isCorrect ? 'true' : 'false');
        }
        if (feedback) {
          feedback.className = hasAnswer ? 'instant-feedback visible ' + (isCorrect ? 'correct' : 'wrong') : 'instant-feedback';
          feedback.textContent = hasAnswer
            ? (isCorrect ? '✓ 填空正确！' : '✗ 填空答案不匹配，请继续检查。')
            : '';
        }
      }
      notifyParentProgress();
    }

    function notifyParentProgress() {
      if (!paperData || !paperData.questions) return;
      const total = paperData.questions.length;
      const answered = Object.keys(answers).length;
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'TPAPER_PROGRESS',
          answered,
          total,
          percent: Math.round((answered / total) * 100)
        }, parentOrigin || '*');
      }
    }

    function normalizeAnswer(value) {
      return String(value || '').normalize('NFKC').trim().toLowerCase().replace(/[\\s\\p{P}\\p{S}]/gu, '');
    }

    function isFillBlankCorrect(userAnswer, correctAnswer) {
      const answer = normalizeAnswer(userAnswer);
      const acceptedAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
      return answer.length > 0 && acceptedAnswers.some(item => answer === normalizeAnswer(item));
    }

    function setGradingStatus(qid, message, state) {
      const status = document.getElementById('grade-status-' + qid);
      if (status) {
        status.textContent = message;
        status.className = 'grading-status ' + (state || '');
      }
    }

    function toggleAnswer(qid) {
      const drawer = document.getElementById('expl-' + qid);
      const button = document.getElementById('answer-toggle-' + qid);
      if (!drawer || !button) return;
      const visible = drawer.classList.toggle('visible');
      button.setAttribute('aria-expanded', String(visible));
      button.textContent = visible ? '隐藏答案 & 解析' : '显示答案 & 解析';
      if (visible) triggerKaTeX();
    }

    async function requestSubjectiveGrade(q, answer) {
      if (!answer || !String(answer).trim()) {
        return { grade: null, error: '请先填写答案后再进行大模型评分' };
      }
      if (!gradingEndpoint || window.location.protocol === 'file:') {
        return { grade: null, error: '当前离线 HTML 无法调用大模型，请在 tpaper 页面中打开评分' };
      }

      setGradingStatus(q.id, '大模型评分中…', 'pending');
      const response = await fetch(gradingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          answer,
          referenceAnswer: q.correctAnswer,
          explanation: q.explanation,
          points: q.points,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || !data.grade) {
        throw new Error(data.error || '大模型评分失败');
      }
      return { grade: data.grade };
    }

    async function submitTest() {
      if (submitted || !paperData) return;
      submitted = true;
      clearInterval(timerInterval);

      let earnedPoints = 0;
      let correctCount = 0;
      let gradingUnavailableCount = 0;
      const gradingResults = new Map();
      const submitBtn = document.getElementById('submitBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '正在评分，请稍候…';
      }

      const subjectiveQuestions = paperData.questions.filter(q => q.type === 'long-answer');
      await Promise.all(subjectiveQuestions.map(async q => {
        try {
          const result = await requestSubjectiveGrade(q, answers[q.id]);
          gradingResults.set(q.id, result);
          if (result.grade) {
            setGradingStatus(q.id, '模型评分完成：' + result.grade.score + ' / ' + q.points + ' 分。', 'success');
          } else {
            setGradingStatus(q.id, result.error || '评分服务暂时不可用，请稍后重试', 'error');
          }
        } catch (error) {
          const message = error && typeof error.message === 'string' ? error.message : '大模型评分失败';
          gradingResults.set(q.id, { grade: null, error: message });
          setGradingStatus(q.id, message, 'error');
        }
      }));

      paperData.questions.forEach((q, idx) => {
        const userAns = answers[q.id];
        let isCorrect = false;

        if (q.type === 'single-choice') {
          isCorrect = String(userAns || '').trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase();
        } else if (q.type === 'fill-blank') {
          isCorrect = isFillBlankCorrect(userAns, q.correctAnswer);
        } else if (q.type === 'long-answer') {
          const result = gradingResults.get(q.id);
          if (result && result.grade) {
            earnedPoints += Number(result.grade.score) || 0;
            correctCount++;
            setGradingStatus(q.id, '模型评分：' + result.grade.score + ' / ' + q.points + ' 分。' + (result.grade.feedback ? ' ' + result.grade.feedback : ''), 'success');
          } else {
            gradingUnavailableCount++;
            setGradingStatus(q.id, (result && result.error) || '评分服务暂时不可用，请稍后重试', 'error');
          }
        }

        if (isCorrect && q.type !== 'long-answer') {
          earnedPoints += q.points;
          correctCount++;
        }

        if (q.type === 'single-choice' && q.options) {
          q.options.forEach(opt => {
            const el = document.getElementById('label-' + q.id + '-' + opt.key);
            if (el) {
              el.classList.remove('selected');
              if (opt.key === q.correctAnswer) {
                el.classList.add('correct-reveal');
              } else if (opt.key === userAns) {
                el.classList.add('wrong-reveal');
              }
            }
          });
        } else {
          const inputEl = document.getElementById('input-' + q.id);
          if (inputEl) {
            const subjectiveGrade = q.type === 'long-answer' ? gradingResults.get(q.id)?.grade : null;
            const passed = q.type === 'long-answer' ? Number(subjectiveGrade?.score || 0) > 0 : isCorrect;
            inputEl.disabled = true;
            inputEl.style.borderColor = passed ? 'var(--correct)' : 'var(--wrong)';
            inputEl.style.background = passed ? '#E8FBF0' : '#FEE2E2';
          }
        }

      });

      triggerKaTeX();

      const banner = document.getElementById('scoreBanner');
      if (banner) {
        banner.style.display = 'block';
        document.getElementById('scoreDisplay').innerText = earnedPoints + ' / ' + paperData.totalPoints;
        document.getElementById('scoreSummary').innerText = '你在 ' + Math.floor(secondsElapsed / 60) + ' 分 ' + (secondsElapsed % 60) + ' 秒内完成了全卷作答，模型评分结果为 ' + earnedPoints + ' / ' + paperData.totalPoints + ' 分。';
      }

      if (submitBtn) {
        submitBtn.style.display = 'none';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (gradingUnavailableCount > 0) {
        document.getElementById('scoreSummary').innerText += ' 另有 ' + gradingUnavailableCount + ' 道主观题尚未获得模型评分。';
      }

      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'TPAPER_SUBMIT',
          score: earnedPoints,
          maxScore: paperData.totalPoints,
          correctCount,
          totalQuestions: paperData.questions.length,
          durationSeconds: secondsElapsed,
          gradingUnavailableCount,
        }, parentOrigin || '*');
      }
    }

    if (window.parent && window.parent !== window && paperData) {
      window.parent.postMessage({ type: 'TPAPER_READY', title: paperData.title }, parentOrigin || '*');
    }
  </script>
</body>
</html>`;
}
