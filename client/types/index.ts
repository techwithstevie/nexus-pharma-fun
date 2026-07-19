export type AdTone = 'hopeful' | 'clinical' | 'empowering' | 'informative';
export type MediaJobStatus = 'queued' | 'running' | 'completed' | 'failed';
export type MediaKind = 'image' | 'video';

export interface MediaJob {
  id: string;
  kind: MediaKind;
  status: MediaJobStatus;
  prompt: string;
  created_at: string;
  updated_at: string;
  progress: number;
  error: string | null;
  result_url: string | null;
  thumbnail_url: string | null;
  meta: Record<string, unknown>;
}

export interface ImageGenerateRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number | null;
  product_name?: string;
  style?: string;
}

export interface VideoGenerateRequest {
  prompt: string;
  negative_prompt?: string;
  seconds?: number;
  fps?: number;
  width?: number;
  height?: number;
  seed?: number | null;
  source_image_job_id?: string | null;
  product_name?: string;
}

export interface SceneAssetRequest {
  drug_name: string;
  scene_number: number;
  visual_description: string;
  voiceover?: string;
  on_screen_text?: string | null;
  generate_video?: boolean;
  style?: string;
}

export type ContentStatus =
  | 'draft'
  | 'needs_mlr'
  | 'in_review'
  | 'needs_changes'
  | 'approved'
  | 'archived';

export type AdMode = 'copy' | 'commercial';

export interface AdGenerationRequest {
  drug_name: string;
  indication: string;
  key_benefits: string[];
  target_audience: string;
  tone: AdTone;
  include_isi: boolean;
  black_box_warning?: string;
}

export interface CommercialScriptRequest extends AdGenerationRequest {
  duration_seconds: 30 | 60;
  setting: string;
  protagonist_description: string;
}

export interface AdCopyResponse {
  drug_name: string;
  headline: string;
  body_copy: string;
  cta: string;
  isi: string | null;
  compliance_notes: string;
}

export interface Scene {
  scene_number: number;
  duration_seconds: number;
  visual_description: string;
  voiceover: string;
  on_screen_text: string | null;
}

export interface CommercialScriptResponse {
  drug_name: string;
  duration_seconds: number;
  scenes: Scene[];
  isi_voiceover: string;
  compliance_notes: string;
}

export interface SavedProject {
  id: string;
  mode: AdMode;
  drug_name: string;
  created_at: string;
  status: ContentStatus;
  version: number;
  result: AdCopyResponse | CommercialScriptResponse;
}