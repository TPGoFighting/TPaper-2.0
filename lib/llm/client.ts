import { jsonrepair } from 'jsonrepair';

interface MessageContentText {
  type: 'text';
  text: string;
}

interface MessageContentImage {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

export type MessageContent = string | (MessageContentText | MessageContentImage)[];

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: MessageContent;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
}

const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

export async function callQwenLLM(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<string> {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    throw new Error('QWEN_API_KEY 未配置，无法调用 Qwen LLM');
  }
  const baseUrl = process.env.QWEN_BASE_URL || DEFAULT_BASE_URL;
  const model = options.model || process.env.QWEN_MODEL || 'qwen-turbo';

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? Number(process.env.QWEN_TIMEOUT_MS || 60000);
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 3200,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Qwen API Error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    return content;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Qwen LLM API 请求超时 (${Math.round(timeoutMs / 1000)}s)`);
    }
    throw err;
  }
}

/**
 * 结构化 JSON 提取工具函数（自动过滤 markdown 标记并使用 jsonrepair 自动容错修复）
 */
export function extractJsonFromMarkdown<T = any>(text: string): T {
  let cleaned = text.trim();

  // 匹配 ```json ... ``` 或 ``` ... ```
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonMatch && jsonMatch[1]) {
    cleaned = jsonMatch[1].trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      const repaired = jsonrepair(cleaned);
      return JSON.parse(repaired);
    } catch {
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1) {
        const sub = lastBrace > firstBrace ? cleaned.substring(firstBrace, lastBrace + 1) : cleaned.substring(firstBrace);
        const repairedSub = jsonrepair(sub);
        return JSON.parse(repairedSub);
      }
      throw new Error(`无法修复并解析模型返回的 JSON\n原始输出: ${text.slice(0, 300)}`);
    }
  }
}
