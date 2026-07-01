import { create } from "zustand";
import { useAIConfigStore } from "./useAIConfigStore";

export interface GrammarError {
  text: string;
  message: string;
  type: "spelling" | "grammar";
  suggestions: string[];
}

interface GrammarState {
  errors: GrammarError[];
  isChecking: boolean;
  selectedErrorIndex: number;
  highlightKey: number;
  setErrors: (errors: GrammarError[]) => void;
  setIsChecking: (isChecking: boolean) => void;
  setSelectedErrorIndex: (selectedErrorIndex: number) => void;
  incrementHighlightKey: () => void;
  clearErrors: () => void;
  selectError: (index: number) => void;
  checkGrammar: (text: string) => Promise<void>;
}

export const useGrammarStore = create<GrammarState>()((set) => ({
  errors: [],
  isChecking: false,
  selectedErrorIndex: -1,
  highlightKey: 0,
  setErrors: (errors) => set({ errors }),
  setIsChecking: (isChecking) => set({ isChecking }),
  setSelectedErrorIndex: (selectedErrorIndex) => set({ selectedErrorIndex }),
  incrementHighlightKey: () =>
    set((state) => ({ highlightKey: state.highlightKey + 1 })),
  clearErrors: () => set({ errors: [], selectedErrorIndex: -1 }),
  selectError: (index: number) => set({ selectedErrorIndex: index }),

  checkGrammar: async (text: string) => {
    const { openaiApiKey, openaiModelId, openaiApiEndpoint } = useAIConfigStore.getState();

    set({ isChecking: true });

    try {
      const response = await fetch("/api/grammar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: text,
          apiKey: openaiApiKey,
          model: openaiModelId,
          apiEndpoint: openaiApiEndpoint,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("No content in response");
      }

      const parsed = JSON.parse(content);
      if (parsed.errors && Array.isArray(parsed.errors)) {
        set({ errors: parsed.errors });
      }
    } catch (error) {
      console.error("Grammar check error:", error);
    } finally {
      set({ isChecking: false });
    }
  },
}));
