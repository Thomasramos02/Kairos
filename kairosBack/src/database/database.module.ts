import { Module } from '@nestjs/common';
import { createDrizzleProvider } from './drizzle.provider';

const drizzleProvider = createDrizzleProvider();

@Module({
  providers: [drizzleProvider],
  exports: [drizzleProvider],
})
export class DatabaseModule {}
