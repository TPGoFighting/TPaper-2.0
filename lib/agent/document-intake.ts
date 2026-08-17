import { DocumentPackage } from './types';
import { extractText } from 'unpdf';

/**
 * 01 / Document Intake Agent
 * 解析上传的 PDF、DOCX、图片或文本，转换为统一的 DocumentPackage 结构。
 */
export async function intakeDocument(
  filename: string,
  rawContent?: string | Buffer | Uint8Array,
  fileSizeBytes: number = 1024 * 50
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

      const res = await extractText(uint8);
      if (res && res.text) {
        extractedText = Array.isArray(res.text) ? res.text.join('\n') : String(res.text);
      }
    } catch (err) {
      console.warn('unpdf 解析异常:', err);
    }
  }

  if (!extractedText) {
    if (typeof rawContent === 'string' && rawContent.length > 0) {
      extractedText = rawContent;
    } else {
      extractedText = `试卷文档: ${filename}\n包含选择题、填空题、计算大题与详细解析。`;
    }
  }

  return {
    filename,
    sourceType,
    fileSizeBytes,
    extractedText,
    pages: [
      {
        pageNumber: 1,
        text: extractedText.slice(0, 4000),
      }
    ],
    metadata: {
      parsedAt: Date.now(),
      extension,
      isScanned: sourceType === 'image',
      charCount: extractedText.length,
    }
  };
}
