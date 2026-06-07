import { Injectable } from '@nestjs/common';
import {
  DigitalSignalHttpClient,
  WebsiteFetchResult,
} from '../models/digital-signal-detection.model';

@Injectable()
export class FetchDigitalSignalHttpClient implements DigitalSignalHttpClient {
  async fetchHtml(url: string): Promise<WebsiteFetchResult | null> {
    try {
      return await fetchWebsiteHtml(url);
    } catch {
      return null;
    }
  }
}

async function fetchWebsiteHtml(url: string): Promise<WebsiteFetchResult | null> {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(5000),
  });

  if (response.status >= 500) {
    return null;
  }

  return {
    requestedUrl: url,
    finalUrl: response.url,
    statusCode: response.status,
    html: await response.text(),
  };
}
