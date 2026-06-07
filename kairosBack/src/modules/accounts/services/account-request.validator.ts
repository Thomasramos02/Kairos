import { BadRequestException } from '@nestjs/common';
import {
  LoginAccountRequest,
  RegisterAccountRequest,
  UpdateAccountRequest,
} from '../dto/account.dto';

export function assertRegisterAccountRequest(
  request: RegisterAccountRequest,
): void {
  assertText(request.name, 'name');
  assertEmail(request.email);
  assertPassword(request.password);
}

export function assertLoginAccountRequest(request: LoginAccountRequest): void {
  assertEmail(request.email);
  assertPassword(request.password);
}

export function assertUpdateAccountRequest(request: UpdateAccountRequest): void {
  if (request.name !== undefined) {
    assertText(request.name, 'name');
  }
}

function assertText(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new BadRequestException(
      `Invalid ${fieldName}: received "${value}"; expected non-empty text`,
    );
  }
}

function assertEmail(email: string): void {
  if (!email.includes('@')) {
    throw new BadRequestException(
      `Invalid email: received "${email}"; expected email address`,
    );
  }
}

function assertPassword(password: string): void {
  if (password.length < 8) {
    throw new BadRequestException(
      `Invalid password: received length ${password.length}; expected at least 8 characters`,
    );
  }
}
