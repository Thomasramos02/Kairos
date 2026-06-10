import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { createInMemoryId } from '../../common/in-memory-id';
import { DRIZZLE_DATABASE } from '../../database/database.tokens';
import { DrizzleDatabase } from '../../database/drizzle.provider';
import { accounts } from '../../database/schema';
import {
  Account,
  AlertPreference,
  PublicAccount,
} from './models/account.model';

@Injectable()
export class AccountsRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly database: DrizzleDatabase,
  ) {}

  async createAccount(accountInput: Omit<Account, 'id'>): Promise<PublicAccount> {
    const account: Account = { ...accountInput, id: createInMemoryId('user') };
    await this.database.insert(accounts).values(account);

    return toPublicAccount(account);
  }

  async findById(accountId: string): Promise<PublicAccount> {
    const account = await this.database.query.accounts.findFirst({
      where: (table, operators) => operators.eq(table.id, accountId),
    });

    if (account === undefined) {
      throw new NotFoundException(
        `Account not found: received id "${accountId}"; expected existing account id`,
      );
    }

    return toPublicAccount(toAccount(account));
  }

  async findByEmail(email: string): Promise<Account> {
    const account = await this.database.query.accounts.findFirst({
      where: (table, operators) => operators.eq(table.email, email),
    });

    if (account === undefined) {
      throw new UnauthorizedException(
        `Invalid credentials: received email "${email}"; expected registered account credentials`,
      );
    }

    return toAccount(account);
  }

  async updateAccount(
    accountId: string,
    updates: Partial<Pick<Account, 'name' | 'companyName'>> & {
      readonly alertPreference?: AlertPreference;
    },
  ): Promise<PublicAccount> {
    const [account] = await this.database
      .update(accounts)
      .set(updates)
      .where(eq(accounts.id, accountId))
      .returning();

    if (account === undefined) {
      throw new NotFoundException(
        `Account not found: received "${accountId}"; expected existing account id`,
      );
    }

    return toPublicAccount(toAccount(account));
  }
}

function toPublicAccount(account: Account): PublicAccount {
  const { passwordHash: _passwordHash, ...publicAccount } = account;

  return publicAccount;
}

function toAccount(row: typeof accounts.$inferSelect): Account {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    companyName: row.companyName,
    passwordHash: row.passwordHash,
    alertPreference: row.alertPreference as AlertPreference,
  };
}
