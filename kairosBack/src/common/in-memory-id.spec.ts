import { createInMemoryId } from './in-memory-id';

describe('createInMemoryId', () => {
  it('creates an id with the requested prefix', () => {
    expect(createInMemoryId('user')).toMatch(/^user_/);
  });

  it('throws an exception with context for empty prefixes', () => {
    expect(() => createInMemoryId(' ')).toThrow(/expected non-empty text/);
  });
});
