const MIN_SESSION_SECRET_LENGTH = 32;
const MIN_ADMIN_PASSWORD_LENGTH = 12;

export function isAdminAuthConfigured(): boolean {
  const secret = process.env.SESSION_SECRET ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  return secret.length >= MIN_SESSION_SECRET_LENGTH && password.length >= MIN_ADMIN_PASSWORD_LENGTH;
}

export function adminAuthConfigError(): string | null {
  const secret = process.env.SESSION_SECRET ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (secret.length < MIN_SESSION_SECRET_LENGTH) {
    return `SESSION_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters`;
  }
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return `ADMIN_PASSWORD must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}
