const companySuffixes = new Set([
  'co',
  'company',
  'corp',
  'corporation',
  'inc',
  'limited',
  'llc',
  'ltd',
  'the',
]);

export function buildWebsiteCandidateUrls(
  businessName: string,
  city?: string | null,
): readonly string[] {
  const domainNames = buildDomainNameCandidates(businessName, city);

  if (domainNames.length === 0) {
    throw new Error(
      `Invalid businessName: received "${businessName}"; expected words for domain candidate`,
    );
  }

  return domainNames.flatMap((domainName) => [
    `https://${domainName}.com`,
    `https://www.${domainName}.com`,
  ]);
}

function buildDomainNameCandidates(
  businessName: string,
  city?: string | null,
): readonly string[] {
  const words = extractDomainWords(businessName);
  const cityWords = city === null ? [] : extractDomainWords(city ?? '');

  return uniqueCandidates([
    words.join(''),
    words.join('-'),
    [...words, ...cityWords].join(''),
    [...words, ...cityWords].join('-'),
  ]);
}

function extractDomainWords(value: string): readonly string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0 && !companySuffixes.has(word));
}

function uniqueCandidates(candidates: readonly string[]): readonly string[] {
  return [...new Set(candidates.filter((candidate) => candidate.length > 0))];
}
