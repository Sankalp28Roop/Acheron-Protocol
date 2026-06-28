// ─── API Client ───────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:3001';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = { ...options?.headers as Record<string, string> };
  if (options?.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (data as { message?: string }).message ?? res.statusText, data);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Credential {
  id: string;
  type: 'EMAIL' | 'SMS';
  value: string;
  expiresAt: string;
  ttlSeconds: number;
  createdAt: string;
}

export interface Message {
  type: 'EMAIL' | 'SMS';
  subject?: string;
  sender?: string;
  from?: string;
  html?: string;
  text: string;
  messageSid?: string;
  receivedAt: string;
  ts?: number;
  isOTP: boolean;
  otpValue?: string;
}

export interface CredentialCreateRequest {
  type: 'EMAIL' | 'SMS';
  ttlSeconds: number;
  sessionToken: string;
  region?: 'IN' | 'UK' | 'US';
}

export interface CreateCredentialPayload {
  type: 'EMAIL' | 'SMS';
  ttlSeconds: number;
  sessionToken: string;
  region?: 'IN' | 'UK' | 'US';
}

// ─── Credential API ───────────────────────────────────────────────────────────

export const credentialApi = {
  list: (sessionToken: string) =>
    request<{ credentials: Credential[] }>(`/api/v1/credentials?sessionToken=${sessionToken}`),

  create: (payload: CreateCredentialPayload) =>
    request<Credential>('/api/v1/credentials', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  revoke: (id: string, sessionToken: string) =>
    request<void>(`/api/v1/credentials/${id}?sessionToken=${sessionToken}`, {
      method: 'DELETE',
    }),
};

// ─── Messages API ──────────────────────────────────────────────────────────────

export const messageApi = {
  getEmailMessages: (credentialValue: string) =>
    request<{ messages: Message[] }>(
      `/api/v1/webhooks/email/messages/${encodeURIComponent(credentialValue)}`,
    ),

  getSmsMessages: (phoneNumber: string) =>
    request<{ messages: Message[] }>(
      `/api/v1/webhooks/sms/messages/${encodeURIComponent(phoneNumber)}`,
    ),
};

// ─── Session Token ─────────────────────────────────────────────────────────────

const SESSION_KEY = 'cloakcomms_session';

export function getSessionToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem(SESSION_KEY);
  if (!token) {
    token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem(SESSION_KEY, token);
  }
  return token;
}
