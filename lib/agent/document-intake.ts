import { DocumentPackage } from './types';

interface PdfParser {
  getText: (options?: Record<string, unknown>) => Promise<{
    text: string;
    pages: Array<{ text: string }>;
  }>;
  getScreenshot: (options: Record<string, unknown>) => Promise<{
    pages: Array<{ pageNumber: number; dataUrl?: string }>;
  }>;
  destroy: () => Promise<void>;
}

/**
 * 01 / Document Intake Agent
 * 解析上传的 PDF、DOCX、图片或文本，转换为统一的 DocumentPackage 结构。
 */
export async function intakeDocument(
  filename: string,
  rawContent?: string | Buffer | Uint8Array,
  fileSizeBytes: number = 0
): Promise<DocumentPackage> {
  const extension = filename.split('.').pop()?.toLowerCase() || 'pdf';
  let sourceType: DocumentPackage['sourceType'] = 'pdf';

  if (['doc', 'docx'].includes(extension)) {
    sourceType = 'docx';
  } else if (['jpg', 'jpeg', 'png', 'webp', 'bmp'].includes(extension)) {
    sourceType = 'image';
  } else if (['txt', 'md'].includes(extension)) {
    sourceType = 'text';
  }

  let extractedText = '';
  let pageTexts: string[] = [];
  let totalPages = 0;
  let pdfBytes: Uint8Array | undefined;
  let pdfParser: PdfParser | undefined;

  // 针对 PDF 二进制文件使用 unpdf 提取全部页面的真实文本
  if (extension === 'pdf' && rawContent && typeof rawContent !== 'string') {
    try {
      let uint8: Uint8Array;
      if (Buffer.isBuffer(rawContent)) {
        uint8 = new Uint8Array(rawContent.buffer.slice(rawContent.byteOffset, rawContent.byteOffset + rawContent.byteLength));
      } else if (rawContent instanceof Uint8Array) {
        uint8 = new Uint8Array(rawContent.buffer.slice(rawContent.byteOffset, rawContent.byteOffset + rawContent.byteLength));
      } else {
        uint8 = new Uint8Array(rawContent as any);
      }
      pdfBytes = uint8;

      const { PDFParse } = await import(/* webpackIgnore: true */ 'pdf-parse');
      pdfParser = new PDFParse({ data: Buffer.from(uint8) }) as PdfParser;
      const res = await pdfParser.getText({ pageJoiner: '\n' });
      totalPages = res.pages.length;
      pageTexts = res.pages.map((page) => page.text || '');
      extractedText = res.text || pageTexts.join('\n');
    } catch (err) {
      console.warn('unpdf 解析异常:', err);
    }
  }

  if (!extractedText && typeof rawContent === 'string' && rawContent.length > 0) {
    extractedText = rawContent;
    pageTexts = [rawContent];
    totalPages = 1;
  }

  if (totalPages === 0) totalPages = pageTexts.length || 1;
  if (pageTexts.length === 0) pageTexts = Array.from({ length: totalPages }, () => '');

  const resolvedFileSizeBytes = fileSizeBytes || (
    typeof rawContent === 'string' ? Buffer.byteLength(rawContent, 'utf8') : rawContent?.byteLength || 0
  );
  const meaningfulTextLength = extractedText.replace(/\s+/g, '').length;
  const hasMeaningfulText = meaningfulTextLength >= 100;
  const isScanned = sourceType === 'image' || (sourceType === 'pdf' && !hasMeaningfulText);

  const pages: DocumentPackage['pages'] = pageTexts.map((text, index) => ({
    pageNumber: index + 1,
    text: text.slice(0, 4000),
  }));

  if (isScanned && sourceType === 'pdf' && pdfBytes) {
    try {
      if (!pdfParser) {
        const { PDFParse } = await import(/* webpackIgnore: true */ 'pdf-parse');
        pdfParser = new PDFParse({ data: Buffer.from(pdfBytes) }) as PdfParser;
      }
      const screenshots = await pdfParser.getScreenshot({ desiredWidth: 768, imageDataUrl: true, imageBuffer: false });
      for (const screenshot of screenshots.pages) {
        if (screenshot.dataUrl && pages[screenshot.pageNumber - 1]) {
          pages[screenshot.pageNumber - 1].imageUrl = screenshot.dataUrl;
        }
      }
    } catch (err) {
      console.warn('PDF 页面渲染异常，无法进入视觉 OCR:', err);
    }
  } else if (isScanned && sourceType === 'image' && rawContent && typeof rawContent !== 'string') {
    const bytes = Buffer.from(rawContent as Uint8Array);
    pages[0].imageUrl = `data:image/${extension === 'jpg' ? 'jpeg' : extension};base64,${bytes.toString('base64')}`;
  }

  await pdfParser?.destroy();

  return {
    filename,
    sourceType,
    fileSizeBytes: resolvedFileSizeBytes,
    extractedText,
    pages,
    metadata: {
      parsedAt: Date.now(),
      extension,
      totalPages,
      isScanned,
      extractionStatus: isScanned ? 'ocr-required' : 'text-extracted',
      charCount: extractedText.length,
    }
  };
}
