/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { sanitizeRichHtml } from "./sanitizeHtml";

describe("sanitizeRichHtml", () => {
  it("removes executable markup and event handlers", () => {
    const result = sanitizeRichHtml(
      '<script>alert(1)</script><img src=x onerror=alert(1)><p onclick="alert(1)">safe</p>'
    );

    expect(result).toBe("<p>safe</p>");
  });

  it("keeps supported resume formatting", () => {
    const result = sanitizeRichHtml(
      '<ul class="custom-list"><li><strong>TypeScript</strong></li></ul>'
    );

    expect(result).toBe(
      '<ul class="custom-list"><li><strong>TypeScript</strong></li></ul>'
    );
  });
});
