export function extractDomainNameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    throw new Error(`Invalid URL: received "${url}"; expected absolute URL`);
  }
}
