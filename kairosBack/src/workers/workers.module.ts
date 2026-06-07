import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { AlertsModule } from "../modules/alerts/alerts.module";
import { BusinessModule } from "../modules/businesses/business.module";
import { ContactEnrichmentModule } from "../modules/contact-enrichment/contact-enrichment.module";
import { ExportsModule } from "../modules/exports/exports.module";
import { DigitalSignalModule } from "../modules/digital-signals/digital-signal.module";
import { MarketTargetsModule } from "../modules/market-targets/market-targets.module";
import { TimingModule } from "../modules/timing/timing.module";
import { WatchlistModule } from "../modules/watchlist/watchlist.module";
import { OutboxModule } from "../outbox/outbox.module";
import { QueueModule } from "../queue/queue.module";
import { BusinessDiscoveryBootstrap } from "./business-discovery.bootstrap";
import { AlertProcessor } from "./alert.processor";
import { BusinessDiscoveryProcessor } from "./business-discovery.processor";
import { ContactEnrichmentProcessor } from "./contact-enrichment.processor";
import { DigitalSignalProcessor } from "./digital-signal.processor";
import { ExportProcessor } from "./export.processor";
import { TimingRecalculationProcessor } from "./timing-recalculation.processor";
import { TimingScoreProcessor } from "./timing-score.processor";

@Module({
  imports: [
    DatabaseModule,
    QueueModule,
    BusinessModule,
    ContactEnrichmentModule,
    DigitalSignalModule,
    MarketTargetsModule,
    TimingModule,
    WatchlistModule,
    AlertsModule,
    ExportsModule,
    OutboxModule,
  ],
  providers: [
    AlertProcessor,
    BusinessDiscoveryBootstrap,
    BusinessDiscoveryProcessor,
    ContactEnrichmentProcessor,
    DigitalSignalProcessor,
    ExportProcessor,
    TimingRecalculationProcessor,
    TimingScoreProcessor,
  ],
})
export class WorkersModule {}
