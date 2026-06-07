export function extractHtmlField(
  html: string,
  fieldLabels: readonly string[],
): string | null {
  const compactHtml = removeNoisyHtml(html);

  for (const label of fieldLabels) {
    const tableValue = extractTableValue(compactHtml, label);

    if (tableValue !== null) {
      return tableValue;
    }
  }

  return null;
}

export function extractFirstSixDigitCode(value: string | null): string {
  if (value === null) {
    return "";
  }

  return value.match(/\b\d{6}\b/)?.[0] ?? "";
}

function extractTableValue(html: string, label: string): string | null {
  const escapedLabel = escapeRegExp(label);
  const rowPattern = new RegExp(
    `<tr[^>]*>[\\s\\S]*?${escapedLabel}\\s*:?[\\s\\S]*?<\\/t[hd]>\\s*<t[hd][^>]*>([\\s\\S]*?)<\\/t[hd]>[\\s\\S]*?<\\/tr>`,
    "i",
  );
  const siblingPattern = new RegExp(
    `${escapedLabel}\\s*:?\\s*<\\/[^>]+>\\s*<[^>]+>([\\s\\S]*?)<\\/[^>]+>`,
    "i",
  );
  const match = html.match(rowPattern) ?? html.match(siblingPattern);

  return match === null ? null : cleanHtmlText(match[1] ?? "");
}

function removeNoisyHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\s+/g, " ");
}

function cleanHtmlText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
