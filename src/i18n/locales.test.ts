import { describe, expect, it } from "vitest";
import en from "./locales/en.json";
import zh from "./locales/zh.json";

function leafPaths(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

describe("locale resources", () => {
  it("keeps English and Chinese translation keys aligned", () => {
    expect(leafPaths(en).sort()).toEqual(leafPaths(zh).sort());
  });

  it("contains every AI polish dialog label", () => {
    for (const messages of [en, zh]) {
      expect(messages.aiPolishDialog).toMatchObject({
        title: expect.any(String),
        description: {
          polishing: expect.any(String),
          finished: expect.any(String),
        },
        content: {
          original: expect.any(String),
          polished: expect.any(String),
        },
        button: {
          regenerate: expect.any(String),
          cancel: expect.any(String),
          apply: expect.any(String),
        },
      });
    }
  });
});
