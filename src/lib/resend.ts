import { Resend } from 'resend';

// Lazy-initialize to avoid crashing at build time when env vars are missing
let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Proxy for backward-compatible import
export const resend: Resend = new Proxy({} as Resend, {
  get(_target, prop) {
    return (getResend() as unknown as Record<string, unknown>)[prop as string];
  },
});
