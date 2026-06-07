import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  LoginAccountRequest,
  LoginAccountResponse,
  RegisterAccountRequest,
  UpdateAccountRequest,
} from './dto/account.dto';
import { AccountsService } from './accounts.service';
import { PublicAccount } from './models/account.model';

@Controller()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('/auth/register')
  async registerAccount(@Body() request: RegisterAccountRequest): Promise<PublicAccount> {
    return await this.accountsService.registerAccount(request);
  }

  @Post('/auth/login')
  async loginAccount(@Body() request: LoginAccountRequest): Promise<LoginAccountResponse> {
    return await this.accountsService.loginAccount(request);
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
