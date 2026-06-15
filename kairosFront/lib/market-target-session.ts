import { MarketTarget, OfferedService } from './account-api'

export type KairosMarketTargetSession = {
  readonly accountId: string
  readonly cityOrRegion?: string
  readonly desiredCustomerType: string
  readonly industry: string
  readonly offeredService: OfferedService
  readonly state: string
}

const kairosMarketTargetSessionKey = 'kairos.marketTargetSession'

export function readKairosMarketTargetSession(): KairosMarketTargetSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const serializedTarget = window.localStorage.getItem(kairosMarketTargetSessionKey)
  return parseKairosMarketTargetSession(serializedTarget)
}

export function saveKairosMarketTargetSession(
  marketTarget: KairosMarketTargetSession | MarketTarget,
): KairosMarketTargetSession {
  const session = toKairosMarketTargetSession(marketTarget)
  window.localStorage.setItem(kairosMarketTargetSessionKey, JSON.stringify(session))
  return session
}

export function parseKairosMarketTargetSession(
  serializedTarget: string | null,
): KairosMarketTargetSession | null {
  if (serializedTarget === null) {
    return null
  }

  try {
    return JSON.parse(serializedTarget) as KairosMarketTargetSession
  } catch (error) {
    throw new Error(
      `Invalid market target session: received "${serializedTarget.slice(0, 120)}"; expected serialized KairosMarketTargetSession`,
      { cause: error },
    )
  }
}

function toKairosMarketTargetSession(
  marketTarget: KairosMarketTargetSession | MarketTarget,
): KairosMarketTargetSession {
  return {
    accountId: marketTarget.accountId,
    cityOrRegion: marketTarget.cityOrRegion,
    desiredCustomerType: marketTarget.desiredCustomerType,
    industry: marketTarget.industry,
    offeredService: marketTarget.offeredService,
    state: marketTarget.state,
  }
}
