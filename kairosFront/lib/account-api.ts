export type AlertChannel = 'email' | 'telegram'

export type AlertFrequency = 'daily' | 'weekly' | 'phase-change'

export type OfferedService =
  | 'website-design-development'
  | 'branding'
  | 'seo-local-seo'
  | 'paid-marketing'
  | 'social-media-marketing'
  | 'e-commerce-services'

export type AlertPreference = {
  readonly channels: readonly AlertChannel[]
  readonly frequency: AlertFrequency
}

export type PublicAccount = {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly companyName: string | null
  readonly alertPreference: AlertPreference
}

export type LoginAccountResponse = {
  readonly account: PublicAccount
  readonly accessToken: string
}

export type RegisterAccountPayload = {
  readonly name: string
  readonly email: string
  readonly password: string
  readonly companyName?: string
}

export type UpdateAccountPayload = {
  readonly name?: string
  readonly companyName?: string | null
  readonly alertChannels?: readonly AlertChannel[]
  readonly alertFrequency?: AlertFrequency
}

export type CreateMarketTargetPayload = {
  readonly accountId: string
  readonly country: 'US'
  readonly state: string
  readonly cityOrRegion?: string
  readonly industry: string
  readonly desiredCustomerType: string
  readonly offeredService: OfferedService
}

export type MarketTarget = CreateMarketTargetPayload & {
  readonly id: string
}

type KairosApiEnvironment = {
  readonly NEXT_PUBLIC_KAIROS_API_URL?: string
}

const kairosApiBaseUrl = readKairosApiBaseUrl(readBrowserSafeEnvironment())

export async function registerKairosAccount(
  payload: RegisterAccountPayload,
): Promise<PublicAccount> {
  return await requestKairosApi<PublicAccount>('/auth/register', {
    body: payload,
    method: 'POST',
  })
}

export async function loginKairosAccount(
  email: string,
  password: string,
): Promise<LoginAccountResponse> {
  return await requestKairosApi<LoginAccountResponse>('/auth/login', {
    body: { email, password },
    method: 'POST',
  })
}

export async function updateKairosAccount(
  accountId: string,
  accessToken: string,
  payload: UpdateAccountPayload,
): Promise<PublicAccount> {
  return await requestKairosApi<PublicAccount>(`/accounts/${accountId}`, {
    accessToken,
    body: payload,
    method: 'PATCH',
  })
}

export async function createKairosMarketTarget(
  accessToken: string,
  payload: CreateMarketTargetPayload,
): Promise<MarketTarget> {
  return await requestKairosApi<MarketTarget>('/market-targets', {
    accessToken,
    body: payload,
    method: 'POST',
  })
}

export async function requestKairosApi<ResponseBody>(
  path: string,
  options: {
    readonly accessToken?: string
    readonly body?: object
    readonly method: 'DELETE' | 'GET' | 'PATCH' | 'POST'
  },
): Promise<ResponseBody> {
  const response = await fetch(`${kairosApiBaseUrl}${path}`, {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: buildKairosHeaders(options.accessToken),
    method: options.method,
  })

  if (!response.ok) {
    throw new Error(await buildKairosApiError(response, path))
  }

  return (await response.json()) as ResponseBody
}

export function buildKairosHeaders(accessToken: string | undefined): HeadersInit {
  if (accessToken === undefined) {
    return { 'Content-Type': 'application/json' }
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }
}

async function buildKairosApiError(
  response: Response,
  path: string,
): Promise<string> {
  const responseText = await response.text()
  return buildKairosApiErrorMessage(response.status, path, responseText)
}

export function buildKairosApiErrorMessage(
  statusCode: number,
  path: string,
  responseText: string,
): string {
  const fallback = `Kairos API failed: received ${statusCode} from ${path}; expected 2xx response`

  if (responseText.trim().length === 0) {
    return fallback
  }

  return `${fallback}; body "${responseText.slice(0, 240)}"`
}

export function readKairosApiBaseUrl(environment: KairosApiEnvironment): string {
  return environment.NEXT_PUBLIC_KAIROS_API_URL ?? '/kairos-api'
}

function readBrowserSafeEnvironment(): KairosApiEnvironment {
  if (typeof process === 'undefined') {
    return {}
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_KAIROS_API_URL

  if (apiBaseUrl === undefined) {
    return {}
  }

  return { NEXT_PUBLIC_KAIROS_API_URL: apiBaseUrl }
}
