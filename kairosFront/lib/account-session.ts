import { fetchKairosMe, PublicAccount } from './account-api'

let cachedAccount: PublicAccount | null = null

export async function getOrFetchAccount(): Promise<PublicAccount | null> {
  if (cachedAccount !== null) {
    return cachedAccount
  }

  try {
    cachedAccount = await fetchKairosMe()
    return cachedAccount
  } catch {
    return null
  }
}

export function setCachedAccount(account: PublicAccount): void {
  cachedAccount = account
}

export function clearCachedAccount(): void {
  cachedAccount = null
}
