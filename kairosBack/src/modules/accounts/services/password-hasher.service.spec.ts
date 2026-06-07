import { PasswordHasherService } from './password-hasher.service';

describe('PasswordHasherService', () => {
  it('hashes passwords without storing the raw value', async () => {
    const passwordHasher = new PasswordHasherService();
    const passwordHash = await passwordHasher.hashPassword('password123');

    expect(passwordHash).toMatch(/^scrypt:/);
    expect(passwordHash).not.toContain('password123');
  });

  it('verifies matching passwords', async () => {
    const passwordHasher = new PasswordHasherService();
    const passwordHash = await passwordHasher.hashPassword('password123');

    await expect(
      passwordHasher.verifyPassword('password123', passwordHash),
    ).resolves.toBe(true);
  });

  it('rejects non-matching passwords', async () => {
    const passwordHasher = new PasswordHasherService();
    const passwordHash = await passwordHasher.hashPassword('password123');

    await expect(
      passwordHasher.verifyPassword('wrong-password', passwordHash),
    ).resolves.toBe(false);
  });
});
