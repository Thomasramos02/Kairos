import { classifyBusinessIndustryFromName } from "./business-industry-classifier";

describe("classifyBusinessIndustryFromName", () => {
  it("classifies names into the frontend industry taxonomy", () => {
    expect(classifyBusinessIndustryFromName("SUNRISE BAKERY LLC")).toBe(
      "Food & Beverage",
    );
    expect(classifyBusinessIndustryFromName("NOVA SOFTWARE STUDIO INC")).toBe(
      "Software Development",
    );
    expect(classifyBusinessIndustryFromName("BRIGHT SMILE DENTAL LLC")).toBe(
      "Healthcare - Dental",
    );
  });

  it("keeps unknown names unclassified", () => {
    expect(classifyBusinessIndustryFromName("ACME HOLDINGS LLC")).toBe(
      "unclassified",
    );
  });
});
