import { randomUUID } from 'crypto';

export function createInMemoryId(prefix: string): string {
  if (prefix.trim().length === 0) {
    throw new Error(`Invalid id prefix: received "${prefix}"; expected non-empty text`);
  }

  return `${prefix}_${randomUUID()}`;
}
