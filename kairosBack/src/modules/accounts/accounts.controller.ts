import { Body, Controller, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MutableAuthenticatedRequest } from '../auth/authenticated-request';
import {
  LoginAccountRequest,
  LoginAccountResponse,
  RegisterAccountRequest,
  UpdateAccountRequest,
} from './dto/account.dto';
import { AccountsService } from './accounts.service';
import { PublicAccount } from './models/account.model';
import { JwtTokenService } from '../auth/jwt-token.service';

const kairosTokenCookieName = 'kairos_token';
const kairosTokenCookieMaxAge = 24 * 60 * 60 * 1000;

@Controller()
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  @Post('/auth/register')
  async registerAccount(
    @Body() request: RegisterAccountRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginAccountResponse> {
    const account = await this.accountsService.registerAccount(request);
    const accessToken = this.jwtTokenService.createAccessToken({
      accountId: account.id,
      email: account.email,
    });
    setKairosTokenCookie(response, accessToken);
    return { account, accessToken };
  }

  @Post('/auth/login')
  async loginAccount(
    @Body() request: LoginAccountRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginAccountResponse> {
    const loginResult = await this.accountsService.loginAccount(request);
    setKairosTokenCookie(response, loginResult.accessToken);
    return loginResult;
  }

  @Get('/auth/me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: MutableAuthenticatedRequest): Promise<PublicAccount> {
    const user = request.user!;
    return await this.accountsService.findById(user.accountId);
  }

  @Patch('/accounts/:accountId')
  @UseGuards(JwtAuthGuard)
  async updateAccount(
    @Param('accountId') accountId: string,
    @Body() request: UpdateAccountRequest,
  ): Promise<PublicAccount> {
    return await this.accountsService.updateAccount(accountId, request);
  }
}

function setKairosTokenCookie(response: Response, token: string): void {
  response.cookie(kairosTokenCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: kairosTokenCookieMaxAge,
    path: '/',
  });
}
