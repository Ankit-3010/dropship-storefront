const KEYS = { mobile: 'wa_mobile', name: 'wa_name', ref: 'wa_ref' } as const;

function readUrlParam(key: string): string | undefined {
  const v = new URLSearchParams(window.location.search).get(key);
  return v?.trim() || undefined;
}

/** Persist WhatsApp query params so in-app navigation keeps customer identity. */
export function captureWhatsAppContextFromUrl(): void {
  const mobile = readUrlParam('mobile');
  const name = readUrlParam('name');
  const ref = readUrlParam('ref');
  if (mobile) sessionStorage.setItem(KEYS.mobile, mobile);
  if (name) sessionStorage.setItem(KEYS.name, name);
  if (ref) sessionStorage.setItem(KEYS.ref, ref);
}

export function getWaMobile(): string | undefined {
  return sessionStorage.getItem(KEYS.mobile) || readUrlParam('mobile');
}

export function getWaName(): string | undefined {
  return sessionStorage.getItem(KEYS.name) || readUrlParam('name');
}

export function getWaRef(): string | undefined {
  return sessionStorage.getItem(KEYS.ref) || readUrlParam('ref');
}

export function withWaQuery(path: string): string {
  const q = new URLSearchParams();
  const mobile = getWaMobile();
  const name = getWaName();
  const ref = getWaRef();
  if (mobile) q.set('mobile', mobile);
  if (name) q.set('name', name);
  if (ref) q.set('ref', ref);
  const qs = q.toString();
  if (!qs) return path;
  return path.includes('?') ? `${path}&${qs}` : `${path}?${qs}`;
}

export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}
