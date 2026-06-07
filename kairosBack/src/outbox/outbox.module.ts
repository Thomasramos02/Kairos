import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { QueueModule } from '../queue/queue.module';
import { OutboxPublisherService } from './outbox-publisher.service';
import { OutboxPublisherWorkerService } from './outbox-publisher-worker.service';
import { OutboxRepository } from './outbox.repository';

@Module({
  imports: [DatabaseModule, QueueModule],
  providers: [OutboxPublisherService, OutboxPublisherWorkerService, OutboxRepository],
  exports: [OutboxPublisherService, OutboxPublisherWorkerService, OutboxRepository],
})
export class OutboxModule {}
