import { AlertChannel } from '../models/account.model';
import { PublicAccount } from '../models/account.model';

export type RegisterAccountRequest = {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly companyName?: string;
};

export type LoginAccountRequest = {
  readonly email: string;
  readonly password: string;
};

export type LoginAccountResponse = {
  readonly account: PublicAccount;
  readonly accessToken: string;
};

export type UpdateAccountRequest = {
  readonly name?: string;
  readonly companyName?: string | null;
  readonly alertChannels?: readonly AlertChannel[];
  readonly alertFrequency?: 'daily' | 'weekly' | 'phase-change';
};
