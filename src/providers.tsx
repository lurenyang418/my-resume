import { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { I18nProvider } from "./i18n/I18nProvider";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  systemTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeStateProvider");
  return ctx;
}

function ThemeStateProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("my-resume-theme") as Theme) || "system";
    }
    return "system";
  });
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mq.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" && systemTheme === "dark");

    root.classList.toggle("dark", isDark);
    localStorage.setItem("my-resume-theme", theme);
  }, [theme, systemTheme]);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, systemTheme }}>
      {children}
      <Toaster position="top-center" richColors />
    </ThemeContext.Provider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeStateProvider>
        <I18nProvider>{children}</I18nProvider>
      </ThemeStateProvider>
    </ErrorBoundary>
  );
}
