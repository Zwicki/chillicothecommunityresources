export interface AuthUser {
  email: string;
  name: string;
  picture?: string;
  isSuperUser: boolean;
  provider: 'google';
}

export const SUPER_USER_EMAILS = [
  'rfannin25@gmail.com',
  'rfannin@gmail.com',
];

export const SUPER_USER_EMAIL = 'rfannin25@gmail.com';
export const SUPER_USER_PASSWORD = 'Zwicki0417!';

export function isSuperUserEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return SUPER_USER_EMAILS.includes(clean);
}

// Maintained for backwards compatibility
export function isUserSuperUser(email?: string | null): boolean {
  return isSuperUserEmail(email);
}

export function verifySuperUserPassword(password?: string | null): boolean {
  if (!password) return false;
  return password.trim() === SUPER_USER_PASSWORD;
}

export function createAuthUser(
  email: string,
  name?: string,
  picture?: string,
  isSuperUserConfirmed: boolean = false
): AuthUser {
  const cleanEmail = email.trim().toLowerCase();
  const isSuperUser = isSuperUserConfirmed && isSuperUserEmail(cleanEmail);
  return {
    email: cleanEmail,
    name: name || (isSuperUser ? 'R. Fannin (Super User)' : cleanEmail.split('@')[0]),
    picture: picture || undefined,
    isSuperUser,
    provider: 'google',
  };
}
