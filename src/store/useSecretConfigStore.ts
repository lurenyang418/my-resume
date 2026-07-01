import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SecretConfigState {
  githubToken: string;
  setGithubToken: (token: string) => void;
}

export const useSecretConfigStore = create<SecretConfigState>()(
  persist(
    (set) => ({
      githubToken: "",
      setGithubToken: (githubToken) => set({ githubToken }),
    }),
    {
      name: "secret-config",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
