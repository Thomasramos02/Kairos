export type AuthenticatedRequest = {
  readonly headers: Record<string, string | string[] | undefined>;
  readonly user?: AuthenticatedUser;
};

export type MutableAuthenticatedRequest = {
  readonly headers: Record<string, string | string[] | undefined>;
  user?: AuthenticatedUser;
};

export type AuthenticatedUser = {
  readonly accountId: string;
  readonly email: string;
};
