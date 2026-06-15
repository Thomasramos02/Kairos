import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
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
    channels: readonly ('email' | 'telegram')[],
  ): Promise<AlertEvent> {
    const [alertEvent] = await this.database
      .insert(alertEvents)
      .values({
        id: createInMemoryId('alert'),
        accountId,
        businessId,
        reason,
        channels,
      })
      .returning();
    return toAlertEvent(alertEvent);
  }

  async listByAccount(accountId: string): Promise<readonly AlertEvent[]> {
    const rows = await this.database
      .select()
      .from(alertEvents)
      .where(eq(alertEvents.accountId, accountId))
      .orderBy(alertEvents.createdAt);

    return rows.map(toAlertEvent);
  }

  async markAsRead(id: string): Promise<AlertEvent> {
    const [alertEvent] = await this.database
      .update(alertEvents)
      .set({ readAt: new Date() })
      .where(eq(alertEvents.id, id))
      .returning();

    return toAlertEvent(alertEvent);
  }

  async delete(id: string): Promise<AlertEvent> {
    const [alertEvent] = await this.database
      .delete(alertEvents)
      .where(eq(alertEvents.id, id))
      .returning();

    return toAlertEvent(alertEvent);
  }

  async countUnreadByAccount(accountId: string): Promise<number> {
    const rows = await this.database
      .select()
      .from(alertEvents)
      .where(and(eq(alertEvents.accountId, accountId), isNull(alertEvents.readAt)));

    return rows.length;
  }
}

function toAlertEvent(row: typeof alertEvents.$inferSelect): AlertEvent {
  return {
    id: row.id,
    accountId: row.accountId,
    businessId: row.businessId,
    reason: row.reason as AlertReason,
    channels: row.channels as readonly ('email' | 'telegram')[],
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}
