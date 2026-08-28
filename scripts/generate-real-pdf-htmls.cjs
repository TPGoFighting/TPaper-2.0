const fs = require('node:fs');
const path = require('node:path');

require('sucrase/register');

const { intakeDocument } = require('../lib/agent/document-intake.ts');
const { understandPaperWithLLM } = require('../lib/agent/paper-understanding.ts');
const { generateStandaloneTestHtml } = require('../lib/html-generator.ts');

const inputDir = process.env.TPAPER_REAL_PDF_DIR || '/Users/tylertang/Downloads/未命名文件夹';
const outputDir = process.env.TPAPER_HTML_OUTPUT_DIR || path.join(inputDir, 'tpaper-html-results');
const gradingEndpoint = process.env.TPAPER_GRADE_ENDPOINT || '/api/papers/grade';
const logoPath = process.env.TPAPER_LOGO_PATH || '/Users/tylertang/Downloads/Tabbit/微信图片_20260709002709_69_207.jpg';

const fixtures = [
  '操作系统期末考试试卷_两套_含答案.pdf',
  '操作系统试卷B（含答案）.pdf',
  '概率统计总复习2025-2026-2.pdf',
  '高数下复习讲座2406-严珍珍.pdf',
  '高数下期末.pdf',
  '2023.2.25 软件学院 计基题型回忆 by Fradow.pdf',
  '2021-22第二学期期末算法试卷a卷-试卷(1).pdf',
  '25-26 python.pdf',
  '25-24概率论与数理统计a.pdf',
  '25-24大物上.pdf',
];

function outputName(filename) {
  return `${filename.replace(/\.pdf$/i, '')}-tpaper.html`;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const logoSrc = `file://${encodeURI(logoPath)}`;
  const summary = [];

  for (let index = 0; index < fixtures.length; index += 1) {
    const filename = fixtures[index];
    const inputPath = path.join(inputDir, filename);
    if (!fs.existsSync(inputPath)) throw new Error(`缺少真实 PDF: ${inputPath}`);

    process.stdout.write(`[${index + 1}/${fixtures.length}] 解析 ${filename}\n`);
    const raw = fs.readFileSync(inputPath);
    const documentPackage = await intakeDocument(filename, raw, raw.length);
    const { structuredPaper } = await understandPaperWithLLM(documentPackage);
    const html = generateStandaloneTestHtml(structuredPaper, {
      gradingEndpoint,
      logoSrc,
    });
    const outputPath = path.join(outputDir, outputName(filename));
    fs.writeFileSync(outputPath, html, 'utf8');

    const fillBlankCount = structuredPaper.questions.filter((question) => question.type === 'fill-blank').length;
    const blankSlotCount = (html.match(/class="blank-slot"/g) || []).length;
    const subjectiveCount = structuredPaper.questions.filter((question) => question.type === 'long-answer').length;
    const result = {
      input: inputPath,
      output: outputPath,
      pages: documentPackage.metadata.totalPages,
      questions: structuredPaper.questions.length,
      fillBlankCount,
      blankSlotCount,
      subjectiveCount,
      bytes: Buffer.byteLength(html),
    };
    if (blankSlotCount < fillBlankCount) {
      throw new Error(`填空题题干空位生成不足: ${filename}`);
    }
    summary.push(result);
    process.stdout.write(`[${index + 1}/${fixtures.length}] 完成 ${JSON.stringify(result)}\n`);
  }

  const summaryPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  process.stdout.write(`完成，清单: ${summaryPath}\n`);
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
