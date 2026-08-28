const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

require('sucrase/register');

const { intakeDocument } = require('../lib/agent/document-intake.ts');
const { understandPaperWithLLM, stripAnswerSection } = require('../lib/agent/paper-understanding.ts');

const pdfDir = process.env.TPAPER_REAL_PDF_DIR;
const hasFixtureDirectory = pdfDir && fs.existsSync(pdfDir);

const fixtures = [
  { file: '2021-22第二学期期末算法试卷a卷-试卷(1).pdf', pages: 3, minChars: 1000 },
  { file: '2023.2.25 软件学院 计基题型回忆 by Fradow.pdf', pages: 1, minChars: 0 },
  { file: '25-24大物上.pdf', pages: 5, minChars: 1000 },
  { file: '25-24概率论与数理统计a.pdf', pages: 4, minChars: 0 },
  { file: '25-26 python.pdf', pages: 4, minChars: 0 },
  { file: '操作系统期末考试试卷_两套_含答案.pdf', pages: 22, minChars: 5000 },
  { file: '操作系统试卷B（含答案）.pdf', pages: 9, minChars: 3000 },
  { file: '概率统计总复习2025-2026-2.pdf', pages: 75, minChars: 5000 },
  { file: '高数下复习讲座2406-严珍珍.pdf', pages: 61, minChars: 5000 },
  { file: '高数下期末.pdf', pages: 24, minChars: 0 },
];

test('real PDFs preserve physical page counts and never fabricate extracted text', { skip: !hasFixtureDirectory }, async () => {
  for (const fixture of fixtures) {
    const fullPath = path.join(pdfDir, fixture.file);
    assert.ok(fs.existsSync(fullPath), `missing fixture: ${fixture.file}`);
    const raw = fs.readFileSync(fullPath);
    const pkg = await intakeDocument(fixture.file, raw, raw.length);

    assert.equal(pkg.metadata.totalPages, fixture.pages, fixture.file);
    assert.equal(pkg.pages.length, fixture.pages, fixture.file);
    if (fixture.minChars === 0) {
      assert.equal(pkg.metadata.extractionStatus, 'ocr-required', `${fixture.file} should be marked as OCR-needed`);
      assert.ok(pkg.pages.some((page) => page.imageUrl?.startsWith('data:image/')), `${fixture.file} should expose page images for OCR`);
    } else {
      assert.ok(pkg.extractedText.length >= fixture.minChars, fixture.file);
    }

    if (fixture.file.includes('操作系统')) {
      const sourceText = stripAnswerSection(pkg.extractedText);
      assert.doesNotMatch(sourceText, /详细解答|参考答案/);
      assert.ok(sourceText.length < pkg.extractedText.length, `${fixture.file} answer appendix should be removed`);
    }
  }
});

test('filename similarity cannot select an unrelated sample paper', { skip: !hasFixtureDirectory }, async () => {
  await assert.rejects(
    understandPaperWithLLM({
      filename: '25-24概率论与数理统计a.pdf',
      sourceType: 'pdf',
      fileSizeBytes: 100,
      extractedText: '',
      pages: [],
      metadata: {},
    }),
    /无法从文档中提取可用试卷内容/
  );
});
