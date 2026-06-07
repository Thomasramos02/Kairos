type RdapEvent = {
  readonly eventAction?: unknown;
  readonly eventDate?: unknown;
};

type RdapResponse = {
  readonly events?: unknown;
};

const registrationActions = new Set([
  'registration',
  'registered',
  'domain registration',
]);

export function parseDomainRegisteredAt(response: unknown): Date | null {
  const rdapResponse = response as RdapResponse;

  if (!Array.isArray(rdapResponse.events)) {
    return null;
  }

  return findRegistrationDate(rdapResponse.events);
}

function findRegistrationDate(events: readonly unknown[]): Date | null {
  for (const event of events) {
    const registrationDate = parseRegistrationEvent(event);

    if (registrationDate !== null) {
      return registrationDate;
    }
  }

  return null;
}

function parseRegistrationEvent(event: unknown): Date | null {
  const rdapEvent = event as RdapEvent;

  if (typeof rdapEvent.eventAction !== 'string') {
    return null;
  }

  if (!registrationActions.has(rdapEvent.eventAction.toLowerCase())) {
    return null;
  }

  return parseEventDate(rdapEvent.eventDate);
}

function parseEventDate(eventDate: unknown): Date | null {
  if (typeof eventDate !== 'string') {
    return null;
  }

  const date = new Date(eventDate);

  return Number.isNaN(date.getTime()) ? null : date;
}
