import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { readKairosEnvironment } from '../config/kairos-environment';
import { DRIZZLE_DATABASE } from './database.tokens';
import * as schema from './schema';

export type DrizzleDatabase = ReturnType<typeof drizzle<typeof schema>>;

export function createDrizzleProvider(): Provider<DrizzleDatabase> {
  return {
    provide: DRIZZLE_DATABASE,
    useFactory: (): DrizzleDatabase => {
      const kairosEnvironment = readKairosEnvironment(process.env);
      const pool = new Pool({ connectionString: kairosEnvironment.databaseUrl });

      return drizzle(pool, { schema });
    },
  };
}
