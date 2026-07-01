import React, { createContext, useContext, useEffect, useState } from "react";
import { defaultLocale, locales, type Locale } from "./config";
import zhMessages from "./locales/zh.json";
import enMessages from "./locales/en.json";

const messagesMap: Record<string, Record<string, any>> = {
  zh: zhMessages,
  en: enMessages,
};

function resolveValue(obj: any, path: string): any {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null) return path;
    current = current[key];
  }
  return current;
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  raw: (key: string) => any;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("my-resume-locale");
      if (stored && locales.includes(stored as Locale)) return stored as Locale;
    }
    return defaultLocale;
  });

  useEffect(() => {
    localStorage.setItem("my-resume-locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const messages = messagesMap[locale] || messagesMap[defaultLocale];

  const t = (key: string) => {
    const val = resolveValue(messages, key);
    return typeof val === "string" ? val : key;
  };

  const raw = (key: string) => resolveValue(messages, key);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, raw }}>
      {children}
    </I18nContext.Provider>
  );
}

type TFunction = ((key: string) => string) & { raw: (key: string) => any };

export function useTranslations(namespace?: string) {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslations must be used within I18nProvider");

  const translate = (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return ctx.t(fullKey);
  };

  translate.raw = (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return ctx.raw(fullKey);
  };

  return translate as TFunction;
}

export function useLocale() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLocale must be used within I18nProvider");
  return ctx.locale;
}

export { I18nContext };
