import { Inject, Injectable } from "@nestjs/common";
import { SQL, and, eq, inArray, sql } from "drizzle-orm";
import { createInMemoryId } from "../../common/in-memory-id";
import { DRIZZLE_DATABASE } from "../../database/database.tokens";
import { DrizzleDatabase } from "../../database/drizzle.provider";
import {
  alertEvents,
  businesses,
  digitalSignals,
  outboxEvents,
  timingScores,
  timingStageHistory,
  watchlistItems,
} from "../../database/schema";
import { OutboxEventRecord } from "../../outbox/outbox-event-record";
import {
  DigitalSignalMetadata,
  DigitalSignalName,
  DigitalSignalSocialProfile,
  BusinessContactMethod,
} from "../digital-signals/models/digital-signal.model";
import { BusinessLifecycleStage } from "./models/business-lifecycle.model";
import {
  DiscoveredBusiness,
  NewDiscoveredBusiness,
} from "./models/business.model";
import { calculateOldLeadRetentionCutoff } from "./services/old-lead-retention.policy";

export type StoredBusinessSignal = {
  readonly businessId: string;
  readonly signalName: DigitalSignalName;
  readonly sourceName: string;
  readonly confidenceScore: number;
  readonly metadata: DigitalSignalMetadata;
  readonly serviceImpact: string;
};

export type CreateBusinessSignal = {
  readonly businessId: string;
  readonly signalName: DigitalSignalName;
  readonly sourceName: string;
  readonly confidenceScore: number;
  readonly metadata?: DigitalSignalMetadata;
};

export type BusinessCreationResult = {
  readonly business: DiscoveredBusiness;
  readonly wasCreated: boolean;
};

export type CreateBusinessOutboxRecord = (
  business: DiscoveredBusiness,
) => OutboxEventRecord;

type DrizzleTransaction = Parameters<
  Parameters<DrizzleDatabase["transaction"]>[0]
>[0];

@Injectable()
export class BusinessesRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly database: DrizzleDatabase,
  ) {}

  async createBusiness(
    discoveredBusiness: NewDiscoveredBusiness,
  ): Promise<DiscoveredBusiness> {
    const [business] = await this.database
      .insert(businesses)
      .values(toBusinessInsert(discoveredBusiness))
      .returning();

    return toDiscoveredBusiness(business);
  }

  async createBusinessIfMissing(
    discoveredBusiness: NewDiscoveredBusiness,
  ): Promise<BusinessCreationResult> {
    const existingBusiness = await this.findBySourceDocumentNumber(
      discoveredBusiness.sourceDocumentNumber,
    );

    if (existingBusiness !== null) {
      return { business: existingBusiness, wasCreated: false };
    }

    const business = await this.createBusiness(discoveredBusiness);

    return { business, wasCreated: true };
  }

  async createBusinessWithOutboxIfMissing(
    discoveredBusiness: NewDiscoveredBusiness,
    createOutboxRecord: CreateBusinessOutboxRecord,
  ): Promise<BusinessCreationResult> {
    return await this.database.transaction(async (transaction) => {
      const existingBusiness =
        await this.findBySourceDocumentNumberInTransaction(
          transaction,
          discoveredBusiness.sourceDocumentNumber,
        );

      if (existingBusiness !== null) {
        return { business: existingBusiness, wasCreated: false };
      }

      return await this.createBusinessAndOutbox(
        transaction,
        discoveredBusiness,
        createOutboxRecord,
      );
    });
  }

  private async findBySourceDocumentNumberInTransaction(
    transaction: DrizzleTransaction,
    sourceDocumentNumber: string | null,
  ): Promise<DiscoveredBusiness | null> {
    if (sourceDocumentNumber === null) {
      return null;
    }

    const business = await transaction.query.businesses.findFirst({
      where: (table, operators) =>
        operators.eq(table.sourceDocumentNumber, sourceDocumentNumber),
    });

    return business === undefined ? null : toDiscoveredBusiness(business);
  }

  private async createBusinessAndOutbox(
    transaction: DrizzleTransaction,
    discoveredBusiness: NewDiscoveredBusiness,
    createOutboxRecord: CreateBusinessOutboxRecord,
  ): Promise<BusinessCreationResult> {
    const [createdBusiness] = await transaction
      .insert(businesses)
      .values(toBusinessInsert(discoveredBusiness))
      .returning();
    const business = toDiscoveredBusiness(createdBusiness);

    await transaction.insert(outboxEvents).values({
      ...createOutboxRecord(business),
      id: createInMemoryId("outbox"),
    });

    return { business, wasCreated: true };
  }

  async createSignal(
    signal: CreateBusinessSignal,
  ): Promise<StoredBusinessSignal> {
    const [createdSignal] = await this.database
      .insert(digitalSignals)
      .values({
        ...signal,
        id: createInMemoryId("signal"),
        metadata: signal.metadata ?? {},
        serviceImpact: buildServiceImpact(signal.signalName),
      })
      .returning();

    return toStoredBusinessSignal(createdSignal);
  }

  async listBusinesses(): Promise<readonly DiscoveredBusiness[]> {
    const rows = await this.database.select().from(businesses);

    return rows.map(toDiscoveredBusiness);
  }

  async listMonitorableBusinesses(): Promise<readonly DiscoveredBusiness[]> {
    const rows = await this.database.select().from(businesses);

    return rows
      .filter((business) => business.lifecycleStage !== "archived")
      .map(toDiscoveredBusiness);
  }

  async updateLifecycleStage(
    businessId: string,
    lifecycleStage: BusinessLifecycleStage,
  ): Promise<DiscoveredBusiness | null> {
    const [business] = await this.database
      .update(businesses)
      .set({
        archivedAt: lifecycleStage === "archived" ? new Date() : null,
        lifecycleStage,
      })
      .where(eq(businesses.id, businessId))
      .returning();

    return business === undefined ? null : toDiscoveredBusiness(business);
  }

  async deleteExpiredOldLeadBusinesses(referenceDate: Date): Promise<number> {
    const cutoff = calculateOldLeadRetentionCutoff(referenceDate);

    return await this.database.transaction(async (transaction) => {
      const expiredBusinesses = await this.findExpiredOldLeadBusinessIds(
        transaction,
        cutoff,
      );
      const businessIds = expiredBusinesses.map((business) => business.id);

      if (businessIds.length === 0) {
        return 0;
      }

      await this.deleteBusinessDependencies(transaction, businessIds);
      return await this.deleteBusinessesByIds(transaction, businessIds);
    });
  }

  async findBusinessById(
    businessId: string,
  ): Promise<DiscoveredBusiness | null> {
    const business = await this.database.query.businesses.findFirst({
      where: (table, operators) => operators.eq(table.id, businessId),
    });

    return business === undefined ? null : toDiscoveredBusiness(business);
  }

  private async findBySourceDocumentNumber(
    sourceDocumentNumber: string | null,
  ): Promise<DiscoveredBusiness | null> {
    if (sourceDocumentNumber === null) {
      return null;
    }

    const business = await this.database.query.businesses.findFirst({
      where: (table, operators) =>
        operators.eq(table.sourceDocumentNumber, sourceDocumentNumber),
    });

    return business === undefined ? null : toDiscoveredBusiness(business);
  }

  async findBusinessBySourceDocumentNumber(
    sourceDocumentNumber: string,
  ): Promise<DiscoveredBusiness | null> {
    return await this.findBySourceDocumentNumber(sourceDocumentNumber);
  }

  async listSignalsByBusiness(
    businessId: string,
  ): Promise<readonly StoredBusinessSignal[]> {
    const rows = await this.database
      .select()
      .from(digitalSignals)
      .where(eq(digitalSignals.businessId, businessId));

    return rows.map(toStoredBusinessSignal);
  }

  async hasSignalByName(
    businessId: string,
    signalName: DigitalSignalName,
  ): Promise<boolean> {
    const [signal] = await this.database
      .select({ id: digitalSignals.id })
      .from(digitalSignals)
      .where(
        and(
          eq(digitalSignals.businessId, businessId),
          eq(digitalSignals.signalName, signalName),
        ),
      )
      .limit(1);

    return signal !== undefined;
  }

  async hasSignalByNameAndSource(
    businessId: string,
    signalName: DigitalSignalName,
    sourceName: string,
  ): Promise<boolean> {
    const [signal] = await this.database
      .select({ id: digitalSignals.id })
      .from(digitalSignals)
      .where(
        and(
          eq(digitalSignals.businessId, businessId),
          eq(digitalSignals.signalName, signalName),
          eq(digitalSignals.sourceName, sourceName),
        ),
      )
      .limit(1);

    return signal !== undefined;
  }

  async listSignalsByBusinessIds(
    businessIds: readonly string[],
  ): Promise<readonly StoredBusinessSignal[]> {
    if (businessIds.length === 0) {
      return [];
    }

    const rows = await this.database
      .select()
      .from(digitalSignals)
      .where(inArray(digitalSignals.businessId, [...businessIds]));

    return rows.map(toStoredBusinessSignal);
  }

  private async findExpiredOldLeadBusinessIds(
    transaction: DrizzleTransaction,
    cutoff: Date,
  ): Promise<readonly { readonly id: string }[]> {
    return await transaction
      .select({ id: businesses.id })
      .from(businesses)
      .where(
        and(
          sql<boolean>`${businesses.registeredAt} < ${cutoff}`,
          sql<boolean>`exists ${oldLeadTimingScoreSubquery()}`,
          sql<boolean>`not exists ${watchlistItemSubquery()}`,
        ),
      );
  }

  private async deleteBusinessDependencies(
    transaction: DrizzleTransaction,
    businessIds: readonly string[],
  ): Promise<void> {
    await transaction
      .delete(alertEvents)
      .where(inArray(alertEvents.businessId, [...businessIds]));
    await transaction
      .delete(digitalSignals)
      .where(inArray(digitalSignals.businessId, [...businessIds]));
    await transaction
      .delete(timingStageHistory)
      .where(inArray(timingStageHistory.businessId, [...businessIds]));
    await transaction
      .delete(timingScores)
      .where(inArray(timingScores.businessId, [...businessIds]));
  }

  private async deleteBusinessesByIds(
    transaction: DrizzleTransaction,
    businessIds: readonly string[],
  ): Promise<number> {
    const deletedBusinesses = await transaction
      .delete(businesses)
      .where(inArray(businesses.id, [...businessIds]))
      .returning({ id: businesses.id });

    return deletedBusinesses.length;
  }
}

function oldLeadTimingScoreSubquery(): SQL {
  return sql`(
    select 1
    from ${timingScores}
    where ${timingScores.businessId} = ${businesses.id}
      and ${timingScores.timingStage} = 'old-lead'
  )`;
}

function watchlistItemSubquery(): SQL {
  return sql`(
    select 1
    from ${watchlistItems}
    where ${watchlistItems.businessId} = ${businesses.id}
  )`;
}

function toBusinessInsert(
  business: NewDiscoveredBusiness,
): typeof businesses.$inferInsert {
  return {
    ...business,
    archivedAt: null,
    id: createInMemoryId("biz"),
    lifecycleStage: "candidate",
  };
}

function toDiscoveredBusiness(
  row: typeof businesses.$inferSelect,
): DiscoveredBusiness {
  return {
    id: row.id,
    sourceDocumentNumber: row.sourceDocumentNumber,
    legalName: row.legalName,
    state: row.state,
    city: row.city,
    industry: row.industry,
    archivedAt: row.archivedAt,
    lifecycleStage: row.lifecycleStage as BusinessLifecycleStage,
    registeredAt: row.registeredAt,
    sourceName: row.sourceName,
  };
}

function toStoredBusinessSignal(
  row: typeof digitalSignals.$inferSelect,
): StoredBusinessSignal {
  return {
    businessId: row.businessId,
    signalName: row.signalName as DigitalSignalName,
    sourceName: row.sourceName,
    confidenceScore: row.confidenceScore,
    metadata: parseDigitalSignalMetadata(row.metadata),
    serviceImpact: row.serviceImpact,
  };
}

function buildServiceImpact(signalName: DigitalSignalName): string {
  const impactBySignal: Record<DigitalSignalName, string> = {
    "domain-recently-registered": "Fresh domain timing can support website or branding outreach.",
    "local-presence-incomplete": "Local presence gaps can support SEO and listing cleanup.",
    "online-store-recently-launched": "Store launch signals can support e-commerce services.",
    "social-presence-misaligned": "Missing social presence can support social marketing outreach.",
    "social-profile-detected": "Social profiles help verify brand presence and outreach context.",
    "website-incomplete": "Incomplete pages can support website, SEO, or branding services.",
    "website-missing": "No reachable site can support website or branding services.",
    "website-technology-detected": "Detected technology helps tailor the service recommendation.",
    "business-contact-detected": "Public contact options can support careful outreach planning.",
  };

  return impactBySignal[signalName];
}

function parseDigitalSignalMetadata(value: unknown): DigitalSignalMetadata {
  if (!isRecord(value)) {
    return {};
  }

  return {
    contactMethods: parseContactMethods(value.contactMethods),
    socialProfiles: parseSocialProfiles(value.socialProfiles),
    technologies: parseStringList(value.technologies),
    websiteUrl: parseOptionalString(value.websiteUrl),
  };
}

function parseContactMethods(
  value: unknown,
): readonly BusinessContactMethod[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter(isBusinessContactMethod);
}

function isBusinessContactMethod(value: unknown): value is BusinessContactMethod {
  return (
    isRecord(value) &&
    isContactMethodType(value.type) &&
    typeof value.value === "string" &&
    isContactMethodSource(value.source) &&
    typeof value.confidenceScore === "number" &&
    (value.label === undefined || typeof value.label === "string")
  );
}

function isContactMethodType(value: unknown): value is BusinessContactMethod["type"] {
  return (
    value === "phone" ||
    value === "email" ||
    value === "contact-form" ||
    value === "address" ||
    value === "agent" ||
    value === "officer" ||
    value === "license"
  );
}

function isContactMethodSource(
  value: unknown,
): value is BusinessContactMethod["source"] {
  return (
    value === "registry" ||
    value === "website" ||
    value === "license" ||
    value === "county-btr"
  );
}

function parseSocialProfiles(
  value: unknown,
): readonly DigitalSignalSocialProfile[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter(isSocialProfile);
}

function isSocialProfile(value: unknown): value is DigitalSignalSocialProfile {
  return (
    isRecord(value) &&
    typeof value.network === "string" &&
    typeof value.url === "string"
  );
}

function parseStringList(value: unknown): readonly string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((item): item is string => typeof item === "string");
}

function parseOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
