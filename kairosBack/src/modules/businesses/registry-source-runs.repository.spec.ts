import { formatRegistrySourceRunError } from "./registry-source-runs.repository";

describe("formatRegistrySourceRunError", () => {
  it("formats exception messages for failed source runs", () => {
    expect(formatRegistrySourceRunError(new Error("Source unavailable"))).toBe(
      "Source unavailable",
    );
  });

  it("formats unknown errors with context", () => {
    expect(formatRegistrySourceRunError({ reason: "timeout" })).toBe(
      'Unknown registry source run error: received {"reason":"timeout"}',
    );
  });
});
