import { Injectable } from "@nestjs/common";
import { readKairosEnvironment } from "../../../config/kairos-environment";
import { DiscoveredBusiness } from "../models/business.model";
import {
  BusinessRegistryDiscoveryRequest,
  BusinessRegistryDiscoveryResult,
  BusinessRegistrySource,
} from "./business-registry-source";
import {
  formatSunbizDailyDate,
  listRecentSunbizBusinessDates,
} from "./florida-sunbiz-date";
import { parseFloridaSunbizCorporateFile } from "./florida-sunbiz-parser";

const sunbizDailyFileBaseUrl = "https://sftp.floridados.gov/Public/doc/cor";
const floridaSunbizDailySourceName =
  "Florida Division of Corporations Daily Corporate Filing";

@Injectable()
export class FloridaSunbizDailyClient implements BusinessRegistrySource {
  readonly sourceName = floridaSunbizDailySourceName;

  private readonly environment = readKairosEnvironment(process.env);

  async discoverBusinesses(
    request: BusinessRegistryDiscoveryRequest,
  ): Promise<BusinessRegistryDiscoveryResult> {
    for (const date of listRecentSunbizBusinessDates(new Date(), 7)) {
      const sourceCursor = formatSunbizDailyDate(date);
      const fileContent = await fetchSunbizDailyFile(date, {
        username: this.environment.floridaSunbizUsername,
        password: this.environment.floridaSunbizPassword,
      });

      if (fileContent !== null) {
        return {
          businesses: parseFloridaSunbizCorporateFile(
            fileContent,
            date,
          ),
          sourceCursor,
          sourceName: this.sourceName,
        };
      }
    }

    return {
      businesses: [],
      sourceCursor: null,
      sourceName: this.sourceName,
    };
  }
}

type SunbizPublicCredential = {
  readonly username: string;
  readonly password: string;
};

async function fetchSunbizDailyFile(
  date: Date,
  credential: SunbizPublicCredential,
): Promise<string | null> {
  const fileDate = formatSunbizDailyDate(date);
  const response = await fetchSunbizDailyFileResponse(fileDate, credential);

  if (response === null || !response.ok) {
    return null;
  }

  return await response.text();
}

async function fetchSunbizDailyFileResponse(
  fileDate: string,
  credential: SunbizPublicCredential,
): Promise<Response | null> {
  try {
    return await fetch(buildSunbizDailyFileUrl(fileDate), {
      headers: createSunbizRequestHeaders(credential),
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return null;
  }
}

export function buildSunbizDailyFileUrl(fileDate: string): string {
  return `${sunbizDailyFileBaseUrl}/${fileDate}c.txt`;
}

export function createSunbizRequestHeaders(
  credential: SunbizPublicCredential,
): HeadersInit {
  return {
    Authorization: `Basic ${createBasicCredentialToken(credential)}`,
  };
}

function createBasicCredentialToken(
  credential: SunbizPublicCredential,
): string {
  const credentialPair = `${credential.username}:${credential.password}`;
  const credentialBytes = Buffer.from(credentialPair);

  return credentialBytes.toString("base64");
}
