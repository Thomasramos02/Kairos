export const businessIndustryLabels = [
  "Healthcare - Dental",
  "Healthcare - General",
  "Cleaning Services",
  "Fitness & Wellness",
  "Marketing Agency",
  "Food & Beverage",
  "Accounting Services",
  "Software Development",
  "Landscaping",
  "Logistics",
  "Automotive Services",
  "Business Consulting",
  "IT Services",
  "Real Estate",
  "Legal Services",
] as const;

export type BusinessIndustryLabel = (typeof businessIndustryLabels)[number];

type IndustryRule = {
  readonly industry: BusinessIndustryLabel;
  readonly keywords: readonly string[];
};

const industryRules: readonly IndustryRule[] = [
  { industry: "Healthcare - Dental", keywords: ["dental", "dentist", "orthodont"] },
  { industry: "Healthcare - General", keywords: ["clinic", "medical", "health", "care"] },
  { industry: "Cleaning Services", keywords: ["clean", "janitorial", "maid"] },
  { industry: "Fitness & Wellness", keywords: ["fitness", "gym", "yoga", "wellness"] },
  { industry: "Marketing Agency", keywords: ["marketing", "media", "creative", "agency"] },
  { industry: "Food & Beverage", keywords: ["bakery", "cafe", "restaurant", "food"] },
  { industry: "Accounting Services", keywords: ["accounting", "tax", "bookkeep"] },
  { industry: "Software Development", keywords: ["software", "app", "digital", "studio"] },
  { industry: "Landscaping", keywords: ["landscap", "lawn", "tree"] },
  { industry: "Logistics", keywords: ["logistics", "transport", "freight"] },
  { industry: "Automotive Services", keywords: ["auto", "repair", "mechanic"] },
  { industry: "Business Consulting", keywords: ["consulting", "advisor", "strategy"] },
  { industry: "IT Services", keywords: ["it service", "cloud", "network", "cyber"] },
  { industry: "Real Estate", keywords: ["real estate", "property", "realty"] },
  { industry: "Legal Services", keywords: ["law", "legal", "attorney"] },
];

/**
 * Classifies a registry business name into the site filter taxonomy.
 *
 * Example:
 * classifyBusinessIndustryFromName("Sunrise Bakery LLC") // "Food & Beverage"
 */
export function classifyBusinessIndustryFromName(
  businessName: string,
): BusinessIndustryLabel | "unclassified" {
  const normalizedName = normalizeBusinessName(businessName);

  if (normalizedName.length === 0) {
    return "unclassified";
  }

  return findMatchingIndustry(normalizedName) ?? "unclassified";
}

function findMatchingIndustry(
  normalizedName: string,
): BusinessIndustryLabel | null {
  for (const rule of industryRules) {
    if (matchesAnyKeyword(normalizedName, rule.keywords)) {
      return rule.industry;
    }
  }

  return null;
}

function matchesAnyKeyword(
  normalizedName: string,
  keywords: readonly string[],
): boolean {
  return keywords.some((keyword) => normalizedName.includes(keyword));
}

function normalizeBusinessName(businessName: string): string {
  return businessName.toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
}
