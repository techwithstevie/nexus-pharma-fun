export type AdTone = 'hopeful' | 'clinical' | 'empowering' | 'informative';

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

export type AdMode = 'copy' | 'commercial';

export interface SavedProject {
  id: string;
  mode: AdMode;
  drug_name: string;
  created_at: string;
  result: AdCopyResponse | CommercialScriptResponse;
}
