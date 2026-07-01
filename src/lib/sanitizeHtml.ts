import DOMPurify from "dompurify";

const RICH_TEXT_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "span",
];

export function sanitizeRichHtml(html: string | null | undefined): string {
  return DOMPurify.sanitize(html ?? "", {
    ALLOWED_TAGS: RICH_TEXT_TAGS,
    ALLOWED_ATTR: ["class", "style"],
    ALLOW_DATA_ATTR: false,
  });
}
