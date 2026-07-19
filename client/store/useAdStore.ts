import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AdMode,
  AdGenerationRequest,
  CommercialScriptRequest,
  AdCopyResponse,
  CommercialScriptResponse,
  SavedProject,
  ContentStatus,
} from '@/types';
import { generateAdCopy, generateCommercialScript } from '@/lib/api';

interface AdFormState {
  drug_name: string;
  indication: string;
  key_benefits: string[];
  target_audience: string;
  tone: AdGenerationRequest['tone'];
  include_isi: boolean;
  black_box_warning: string;
  duration_seconds: 30 | 60;
  setting: string;
  protagonist_description: string;
}

interface AdStore {
  mode: AdMode;
  form: AdFormState;
  wizardStep: number;
  isLoading: boolean;
  error: string | null;
  result: AdCopyResponse | CommercialScriptResponse | null;
  projects: SavedProject[];

  setMode: (mode: AdMode) => void;
  setWizardStep: (step: number) => void;
  updateForm: (fields: Partial<AdFormState>) => void;
  resetForm: () => void;
  generate: () => Promise<void>;
  saveProject: () => void;
  deleteProject: (id: string) => void;
  updateProjectStatus: (id: string, status: ContentStatus) => void;
  clearResult: () => void;
}

const defaultForm: AdFormState = {
  drug_name: '',
  indication: '',
  key_benefits: [''],
  target_audience: 'Adults 18+',
  tone: 'informative',
  include_isi: true,
  black_box_warning: '',
  duration_seconds: 30,
  setting: 'Everyday clinical and lifestyle settings',
  protagonist_description: 'Adult patient representative of indicated population',
};

export const useAdStore = create<AdStore>()(
  persist(
    (set, get) => ({
      mode: 'copy',
      form: defaultForm,
      wizardStep: 0,
      isLoading: false,
      error: null,
      result: null,
      projects: [],

      setMode: (mode) => set({ mode, result: null, error: null, wizardStep: 0 }),

      setWizardStep: (wizardStep) => set({ wizardStep }),

      updateForm: (fields) =>
        set((state) => ({ form: { ...state.form, ...fields } })),

      resetForm: () =>
        set({
          form: defaultForm,
          result: null,
          error: null,
          wizardStep: 0,
        }),

      generate: async () => {
        const { mode, form } = get();
        set({ isLoading: true, error: null, result: null });
        try {
          const base: AdGenerationRequest = {
            drug_name: form.drug_name.trim(),
            indication: form.indication.trim(),
            key_benefits: form.key_benefits.filter((b) => b.trim() !== ''),
            target_audience: form.target_audience,
            tone: form.tone,
            include_isi: form.include_isi,
            black_box_warning: form.black_box_warning || undefined,
          };

          let result: AdCopyResponse | CommercialScriptResponse;
          if (mode === 'copy') {
            result = await generateAdCopy(base);
          } else {
            const commercialReq: CommercialScriptRequest = {
              ...base,
              duration_seconds: form.duration_seconds,
              setting: form.setting,
              protagonist_description: form.protagonist_description,
            };
            result = await generateCommercialScript(commercialReq);
          }
          set({ result, isLoading: false });
        } catch (e) {
          set({
            error:
              e instanceof Error
                ? e.message
                : 'Generation failed. Please try again.',
            isLoading: false,
          });
        }
      },

      saveProject: () => {
        const { result, mode, form } = get();
        if (!result) return;
        const project: SavedProject = {
          id: Date.now().toString(),
          mode,
          drug_name: form.drug_name,
          created_at: new Date().toISOString(),
          status: 'needs_mlr',
          version: 1,
          result,
        };
        set((state) => ({ projects: [project, ...state.projects] }));
      },

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      updateProjectStatus: (id, status) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, status } : p
          ),
        })),

      clearResult: () => set({ result: null, error: null }),
    }),
    {
      name: 'pharma-content-workspace',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ projects: state.projects }),
    }
  )
);