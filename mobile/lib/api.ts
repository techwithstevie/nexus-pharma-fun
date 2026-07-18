import { API_BASE_URL } from '@/constants/api';
import type {
  AdGenerationRequest,
  AdCopyResponse,
  CommercialScriptRequest,
  CommercialScriptResponse,
} from '@/types';

async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail ?? `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function generateAdCopy(
  request: AdGenerationRequest
): Promise<AdCopyResponse> {
  return apiFetch<AdCopyResponse>('/ads/copy', request);
}

export async function generateCommercialScript(
  request: CommercialScriptRequest
): Promise<CommercialScriptResponse> {
  return apiFetch<CommercialScriptResponse>('/ads/commercial', request);
}

export async function checkHealth(): Promise<{
  status: string;
  ollama: string;
  model: string;
}> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}
