import { SamplePaper } from './sample-papers';

/**
 * 生成完全自包含的交互式单文件 HTML 试卷产物（HTML Artifact）
 * 内置 KaTeX 公式渲染、响应式布局、大题与简答题适配、倒计时、即时评分、详细解析与 postMessage 通信支持。
 */
export function generateStandaloneTestHtml(paper: SamplePaper): string {
  const safeJson = JSON.stringify(paper).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${paper.title} — tpaper 交互式试卷</title>
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
    .tp-badge {
      background: var(--ink);
      color: #FFFFFF;
      font-weight: 900;
      font-size: 14px;
      padding: 4px 10px;
      border-radius: 6px;
      letter-spacing: -0.5px;
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
  </style>
</head>
<body>

  <header class="header">
    <div class="header-brand">
      <span class="tp-badge">TP</span>
      <span class="header-title">${paper.title}</span>
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
      <h1 style="font-size: 22px; font-weight: 800; margin-bottom: 8px;">${paper.title}</h1>
      <p style="color: var(--slate); font-size: 14px;">${paper.description}</p>
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
            <span class="q-section">${q.section} (${q.points} 分)</span>
          </div>
          <div class="q-text">${q.question}</div>
          ${q.formula ? `<div class="formula-box">$$${q.formula}$$</div>` : ''}
          
          ${q.type === 'single-choice' && q.options ? `
            <div class="options-grid">
              ${q.options.map(opt => `
                <div class="option-label" id="label-${q.id}-${opt.key}" onclick="handleSelect(${q.id}, '${opt.key}')">
                  <span style="font-weight: 800; color: var(--slate);">${opt.key}.</span>
                  <span>${opt.text}</span>
                </div>
              `).join('')}
            </div>
          ` : q.type === 'long-answer' ? `
            <textarea class="input-field textarea-field" name="q_${q.id}" id="input-${q.id}" placeholder="请在此输入解题要点、公式推导或伪代码..." oninput="handleInput(${q.id}, this.value)"></textarea>
          ` : `
            <input type="text" class="input-field" name="q_${q.id}" id="input-${q.id}" placeholder="请输入计算或填空答案..." oninput="handleInput(${q.id}, this.value)">
          `}

          <div class="explanation-drawer" id="expl-${q.id}">
            <div class="explanation-title">💡 官方参考答案与深度分步解析</div>
            <div style="font-size: 14px; color: var(--ink); white-space: pre-wrap;" id="expl-text-${q.id}">${q.explanation}</div>
          </div>
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
          q.options.forEach(opt => {
            const el = document.getElementById('label-' + qid + '-' + opt.key);
            if (el) {
              if (opt.key === optKey) {
                el.classList.add('selected');
              } else {
                el.classList.remove('selected');
              }
            }
          });
        }
      }
      notifyParentProgress();
    }

    function handleInput(qid, val) {
      if (submitted) return;
      answers[qid] = val.trim();
      notifyParentProgress();
    }

    function notifyParentProgress() {
      if (!paperData || !paperData.questions) return;
      const total = paperData.questions.length;
      const answered = Object.keys(answers).length;
      if (window.parent) {
        window.parent.postMessage({
          type: 'TPAPER_PROGRESS',
          answered,
          total,
          percent: Math.round((answered / total) * 100)
        }, '*');
      }
    }

    function submitTest() {
      if (submitted || !paperData) return;
      submitted = true;
      clearInterval(timerInterval);

      let earnedPoints = 0;
      let correctCount = 0;

      paperData.questions.forEach((q, idx) => {
        const userAns = answers[q.id];
        let isCorrect = false;

        if (q.type === 'single-choice') {
          isCorrect = String(userAns || '').trim().toUpperCase() === String(q.correctAnswer).trim().toUpperCase();
        } else if (q.type === 'fill-blank') {
          const u = String(userAns || '').trim();
          const target = String(q.correctAnswer).trim();
          isCorrect = u.length > 0 && (u === target || target.includes(u) || u.includes(target));
        } else {
          // 主观简答题只要作答即给予基准分
          isCorrect = (String(userAns || '').trim().length > 5);
        }

        if (isCorrect) {
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
            inputEl.disabled = true;
            inputEl.style.borderColor = isCorrect ? 'var(--correct)' : 'var(--wrong)';
            inputEl.style.background = isCorrect ? '#E8FBF0' : '#FEE2E2';
          }
        }

        const explDrawer = document.getElementById('expl-' + q.id);
        if (explDrawer) {
          explDrawer.classList.add('visible');
        }
      });

      triggerKaTeX();

      const banner = document.getElementById('scoreBanner');
      if (banner) {
        banner.style.display = 'block';
        document.getElementById('scoreDisplay').innerText = earnedPoints + ' / ' + paperData.totalPoints;
        document.getElementById('scoreSummary').innerText = '你在 ' + Math.floor(secondsElapsed / 60) + ' 分 ' + (secondsElapsed % 60) + ' 秒内完成了全卷作答，参考自评分数为 ' + earnedPoints + ' / ' + paperData.totalPoints + ' 分。';
      }

      const submitBtn = document.getElementById('submitBtn');
      if (submitBtn) {
        submitBtn.style.display = 'none';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (window.parent) {
        window.parent.postMessage({
          type: 'TPAPER_SUBMIT',
          score: earnedPoints,
          maxScore: paperData.totalPoints,
          correctCount,
          totalQuestions: paperData.questions.length,
          durationSeconds: secondsElapsed
        }, '*');
      }
    }

    if (window.parent && paperData) {
      window.parent.postMessage({ type: 'TPAPER_READY', title: paperData.title }, '*');
    }
  </script>
</body>
</html>`;
}
