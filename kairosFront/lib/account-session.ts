import { LoginAccountResponse, PublicAccount } from './account-api'

export type KairosAccountSession = {
  readonly account: PublicAccount
  readonly accessToken: string
}

const kairosAccountSessionKey = 'kairos.accountSession'

export function readKairosAccountSession(): KairosAccountSession | null {
  const serializedSession = window.localStorage.getItem(kairosAccountSessionKey)
  return parseKairosAccountSession(serializedSession)
}

export function parseKairosAccountSession(
  serializedSession: string | null,
): KairosAccountSession | null {

  if (serializedSession === null) {
    return null
  }

  try {
    return JSON.parse(serializedSession) as KairosAccountSession
  } catch (error) {
    throw new Error(
      `Invalid account session: received "${serializedSession.slice(0, 120)}"; expected serialized KairosAccountSession`,
      { cause: error },
    )
  }
}

export function saveKairosAccountSession(
  loginResponse: LoginAccountResponse,
): KairosAccountSession {
  const session = {
    account: loginResponse.account,
    accessToken: loginResponse.accessToken,
  }

  window.localStorage.setItem(kairosAccountSessionKey, serializeKairosAccountSession(session))
  return session
}

export function updateKairosAccountSession(
  account: PublicAccount,
): KairosAccountSession {
  const currentSession = readKairosAccountSession()

  if (currentSession === null) {
    throw new Error(
      'Invalid account session: received empty local session; expected login before account update',
    )
  }

  const nextSession = { ...currentSession, account }
  window.localStorage.setItem(kairosAccountSessionKey, serializeKairosAccountSession(nextSession))
  return nextSession
}

export function serializeKairosAccountSession(
  session: KairosAccountSession,
): string {
  return JSON.stringify(session)
}

export function clearKairosAccountSession(): void {
  window.localStorage.removeItem(kairosAccountSessionKey)
}
