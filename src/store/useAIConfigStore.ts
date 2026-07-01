import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AIConfigState {
  openaiApiKey: string;
  openaiModelId: string;
  openaiApiEndpoint: string;
  setOpenaiApiKey: (apiKey: string) => void;
  setOpenaiModelId: (modelId: string) => void;
  setOpenaiApiEndpoint: (endpoint: string) => void;
}

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set) => ({
      openaiApiKey: "",
      openaiModelId: "",
      openaiApiEndpoint: "https://api.openai.com/v1",
      setOpenaiApiKey: (apiKey: string) => set({ openaiApiKey: apiKey }),
      setOpenaiModelId: (modelId: string) => set({ openaiModelId: modelId }),
      setOpenaiApiEndpoint: (endpoint: string) => set({ openaiApiEndpoint: endpoint })
    }),
    {
      name: "ai-config",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
