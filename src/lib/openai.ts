import OpenAI from 'openai';

export const PRD_MODEL = 'meta/llama-3.1-70b-instruct';
export const FALLBACK_MODEL = 'meta/llama-3.1-8b-instruct';

// Lazy-initialize to avoid crashing at build time when env vars are missing
let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }
  return _openai;
}

// Keep backward compat export
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as unknown as Record<string, unknown>)[prop as string];
  },
});
