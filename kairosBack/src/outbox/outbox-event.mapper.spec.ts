import { mapDomainEventToOutboxRecord } from './outbox-event.mapper';

describe('mapDomainEventToOutboxRecord', () => {
  it('maps a domain event to an outbox record', () => {
    const outboxRecord = mapDomainEventToOutboxRecord({
      name: 'BusinessDiscovered',
      aggregateId: 'fb90a313-224c-4f8f-96e9-c1bb15d5efc2',
      payload: { state: 'Florida' },
    });

    expect(outboxRecord).toEqual({
      eventName: 'BusinessDiscovered',
      aggregateId: 'fb90a313-224c-4f8f-96e9-c1bb15d5efc2',
      payload: { state: 'Florida' },
    });
  });

  it('throws an exception with context for empty aggregate ids', () => {
    expect(() =>
      mapDomainEventToOutboxRecord({
        name: 'BusinessDiscovered',
        aggregateId: ' ',
        payload: {},
      }),
    ).toThrow(/expected a non-empty id/);
  });
});
