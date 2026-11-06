export interface AuthUser {
  email: string;
  name: string;
  picture?: string;
  isSuperUser: boolean;
  provider: 'google';
}

export const SUPER_USER_EMAIL = 'rfannin@gmail.com';

export function isUserSuperUser(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_USER_EMAIL.toLowerCase();
}

export function createAuthUser(email: string, name?: string, picture?: string): AuthUser {
  const cleanEmail = email.trim().toLowerCase();
  const isSuperUser = isUserSuperUser(cleanEmail);
  return {
    email: cleanEmail,
    name: name || (isSuperUser ? 'R. Fannin (Super User)' : cleanEmail.split('@')[0]),
    picture: picture || undefined,
    isSuperUser,
    provider: 'google'
  };
}
