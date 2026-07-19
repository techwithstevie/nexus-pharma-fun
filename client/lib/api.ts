import { API_BASE_URL } from '@/constants/api';
import type {
  AdGenerationRequest,
  AdCopyResponse,
  CommercialScriptRequest,
  CommercialScriptResponse,
  ImageGenerateRequest,
  MediaJob,
  SceneAssetRequest,
  VideoGenerateRequest,
} from '@/types';

async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({
      detail: 'Unable to complete request. Please try again.',
    }));
    const detail =
      typeof err.detail === 'string'
        ? err.detail
        : 'Unable to complete request. Please try again.';
    throw new Error(detail);
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
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });
  if (!response.ok) {
    throw new Error('Service unavailable');
  }
  return response.json();
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // path like /media/files/images/xyz.png — API_BASE_URL includes /api/v1
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function generateImage(body: ImageGenerateRequest): Promise<MediaJob> {
  return apiFetch<MediaJob>('/media/images', body);
}

export async function generateVideo(body: VideoGenerateRequest): Promise<MediaJob> {
  return apiFetch<MediaJob>('/media/videos', body);
}

export async function generateSceneAssets(
  body: SceneAssetRequest
): Promise<{ image_job: MediaJob; video_job: MediaJob | null }> {
  return apiFetch('/media/scenes', body);
}

export async function getMediaJob(id: string): Promise<MediaJob> {
  const response = await fetch(`${API_BASE_URL}/media/jobs/${id}`, {
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });
  if (!response.ok) throw new Error('Failed to load media job');
  return response.json();
}

export async function listMediaJobs(): Promise<MediaJob[]> {
  const response = await fetch(`${API_BASE_URL}/media/jobs`, {
    headers: { 'ngrok-skip-browser-warning': 'true' },
  });
  if (!response.ok) throw new Error('Failed to list media jobs');
  return response.json();
}

export async function pollMediaJob(
  id: string,
  {
    intervalMs = 2000,
    timeoutMs = 10 * 60 * 1000,
  }: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<MediaJob> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const job = await getMediaJob(id);
    if (job.status === 'completed' || job.status === 'failed') return job;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Media job timed out');
}