import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  LoginAccountResponse,
  LoginAccountRequest,
  RegisterAccountRequest,
  UpdateAccountRequest,
} from './dto/account.dto';
import { AccountsRepository } from './accounts.repository';
import { AlertPreference, PublicAccount } from './models/account.model';
import { JwtTokenService } from '../auth/jwt-token.service';
import {
  assertLoginAccountRequest,
  assertRegisterAccountRequest,
  assertUpdateAccountRequest,
} from './services/account-request.validator';
import { PasswordHasherService } from './services/password-hasher.service';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly passwordHasher: PasswordHasherService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async registerAccount(request: RegisterAccountRequest): Promise<PublicAccount> {
    assertRegisterAccountRequest(request);

    return await this.accountsRepository.createAccount({
      name: request.name,
      email: request.email,
      passwordHash: await this.passwordHasher.hashPassword(request.password),
      companyName: request.companyName ?? null,
      alertPreference: { channels: ['email'], frequency: 'phase-change' },
    });
  }

  async loginAccount(request: LoginAccountRequest): Promise<LoginAccountResponse> {
    assertLoginAccountRequest(request);
    const account = await this.accountsRepository.findByEmail(request.email);
    const passwordMatches = await this.passwordHasher.verifyPassword(
      request.password,
      account.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        `Invalid credentials: received email "${request.email}"; expected registered account credentials`,
      );
    }

    const publicAccount = {
      id: account.id,
      name: account.name,
      email: account.email,
      companyName: account.companyName,
      alertPreference: account.alertPreference,
    };

    return {
      account: publicAccount,
      accessToken: this.jwtTokenService.createAccessToken({
        accountId: account.id,
        email: account.email,
      }),
    };
  }

  async updateAccount(
    accountId: string,
    request: UpdateAccountRequest,
  ): Promise<PublicAccount> {
    assertUpdateAccountRequest(request);

    return await this.accountsRepository.updateAccount(accountId, buildAccountUpdates(request));
  }
}

function buildAccountUpdates(request: UpdateAccountRequest): {
  readonly name?: string;
  readonly companyName?: string | null;
  readonly alertPreference?: AlertPreference;
} {
  return {
    ...(request.name !== undefined ? { name: request.name } : {}),
    ...(request.companyName !== undefined ? { companyName: request.companyName } : {}),
    ...(buildAlertPreference(request) !== undefined
      ? { alertPreference: buildAlertPreference(request) }
      : {}),
  };
}

function buildAlertPreference(
  request: UpdateAccountRequest,
): AlertPreference | undefined {
  if (request.alertChannels === undefined && request.alertFrequency === undefined) {
    return undefined;
  }

  return {
    channels: request.alertChannels ?? ['email'],
    frequency: request.alertFrequency ?? 'phase-change',
  };
}
