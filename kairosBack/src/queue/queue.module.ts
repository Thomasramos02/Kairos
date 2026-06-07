import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { readKairosEnvironment } from "../config/kairos-environment";
import { AuthModule } from "../modules/auth/auth.module";
import { kairosQueueNames } from "./kairos-queue-name";
import { KairosJobDispatcherService } from "./kairos-job-dispatcher.service";
import { JobsController } from "./jobs.controller";

@Module({
  imports: [
    AuthModule,
    BullModule.forRootAsync({
      useFactory: () => {
        const kairosEnvironment = readKairosEnvironment(process.env);

        return {
          connection: {
            url: kairosEnvironment.valkeyUrl,
          },
        };
      },
    }),
    BullModule.registerQueue(
      { name: kairosQueueNames.businessDiscovery },
      { name: kairosQueueNames.digitalSignal },
      { name: kairosQueueNames.contactEnrichment },
      { name: kairosQueueNames.timingRecalculation },
      { name: kairosQueueNames.timingScore },
      { name: kairosQueueNames.alert },
      { name: kairosQueueNames.export },
    ),
  ],
  controllers: [JobsController],
  providers: [KairosJobDispatcherService],
  exports: [BullModule, KairosJobDispatcherService],
})
export class QueueModule {}
