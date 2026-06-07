import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { createInMemoryId } from '../../common/in-memory-id';
import { DRIZZLE_DATABASE } from '../../database/database.tokens';
import { DrizzleDatabase } from '../../database/drizzle.provider';
import { alertEvents } from '../../database/schema';
import { AlertEvent, AlertReason } from './models/alert.model';

@Injectable()
export class AlertsRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly database: DrizzleDatabase,
  ) {}

  async createAlert(
    accountId: string,
    businessId: string,
    reason: AlertReason,
  ): Promise<AlertEvent> {
    const [alertEvent] = await this.database
      .insert(alertEvents)
      .values({
        id: createInMemoryId('alert'),
        accountId,
        businessId,
        reason,
        channels: ['email', 'telegram'],
      })
      .returning();

    return toAlertEvent(alertEvent);
  }

  async listByAccount(accountId: string): Promise<readonly AlertEvent[]> {
    const rows = await this.database
      .select()
      .from(alertEvents)
      .where(eq(alertEvents.accountId, accountId));

    return rows.map(toAlertEvent);
  }
}

function toAlertEvent(row: typeof alertEvents.$inferSelect): AlertEvent {
  return {
    id: row.id,
    accountId: row.accountId,
    businessId: row.businessId,
    reason: row.reason as AlertReason,
    channels: row.channels as readonly ('email' | 'telegram')[],
    createdAt: row.createdAt.toISOString(),
  };
}
