import {
  buildSunbizDailyFileUrl,
  createSunbizRequestHeaders,
} from "./florida-sunbiz-daily.client";

describe("buildSunbizDailyFileUrl", () => {
  it("builds the public HTTP path for Sunbiz daily corporate files", () => {
    expect(buildSunbizDailyFileUrl("20260603")).toBe(
      "https://sftp.floridados.gov/Public/doc/cor/20260603c.txt",
    );
  });
});

describe("createSunbizRequestHeaders", () => {
  it("builds a Basic auth header for public Sunbiz credentials", () => {
    const headers = createSunbizRequestHeaders({
      username: "Public",
      password: "PubAccess1845!",
    });

    expect(headers).toEqual({
      Authorization: "Basic UHVibGljOlB1YkFjY2VzczE4NDUh",
    });
  });
});
