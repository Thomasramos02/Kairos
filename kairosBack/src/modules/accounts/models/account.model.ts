export type AlertChannel = 'email' | 'telegram';

export type AlertPreference = {
  readonly channels: readonly AlertChannel[];
  readonly frequency: 'daily' | 'weekly' | 'phase-change';
};

export type Account = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly companyName: string | null;
  readonly passwordHash: string;
  readonly alertPreference: AlertPreference;
};

export type PublicAccount = Omit<Account, 'passwordHash'>;
