/**
 * Small text sanitizers for model output.
 *
 * Goal: keep UI clean when the model returns markdown/code fences/JSON fragments.
 * These are intentionally conservative and dependency-free.
 */

export function stripMarkdownCodeFences(text: string): string {
  return text
    .replace(/```json\s*/gi, "")
    .replace(/```[a-z]*\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
}

export function stripMarkdownEmphasis(text: string): string {
  // Remove common emphasis markers without trying to fully parse markdown
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .trim();
}

export function isLikelyJsonFragment(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return (
    (t.startsWith("{") && t.includes("}")) ||
    (t.startsWith("[") && t.includes("]")) ||
    t.includes(`"title"`) ||
    t.includes(`"content"`) ||
    t.includes(`"suggestedAction"`) ||
    t.includes(`"summary"`) ||
    t.includes(`"patterns"`) ||
    t.includes(`"suggestions"`)
  );
}

export function sanitizeModelField(value: unknown): string {
  if (typeof value !== "string") return "";
  let text = value.trim();
  text = stripMarkdownCodeFences(text);
  text = text.replace(/^json\s*[:\-]?\s*/i, "").trim();
  text = stripMarkdownEmphasis(text);
  // Remove leading list markers
  text = text.replace(/^[-*•]\s+/, "").trim();
  return text;
}

