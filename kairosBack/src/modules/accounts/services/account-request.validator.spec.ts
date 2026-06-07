import { assertRegisterAccountRequest } from './account-request.validator';

describe('assertRegisterAccountRequest', () => {
  it('accepts valid registration requests', () => {
    expect(() =>
      assertRegisterAccountRequest({
        name: 'Thomas',
        email: 'thomas@example.com',
        password: 'password123',
      }),
    ).not.toThrow();
  });

  it('throws an exception with context for invalid emails', () => {
    expect(() =>
      assertRegisterAccountRequest({
        name: 'Thomas',
        email: 'invalid',
        password: 'password123',
      }),
    ).toThrow(/expected email address/);
  });
});
