import { UserAccount } from "../types";

export interface RegisteredAccount extends UserAccount {
  passwordHash: string; // "01234"
}

export const REGISTERED_ACCOUNTS: RegisteredAccount[] = [
  {
    id: "admin-priscilla",
    name: "Priscilla V. Andow",
    email: "priscilla.andow@binus.ac.id",
    role: "admin",
    initials: "PA",
    workspaceName: "Lead Audit Workspace",
    description: "Akun Administrator",
    isCleanAccount: false,
    passwordHash: "01234",
  },
  {
    id: "user-auditor",
    name: "Staff Auditor",
    email: "user@gmail.com",
    role: "user",
    initials: "US",
    workspaceName: "Field Staff Workspace",
    description: "Akun Pengguna Biasa",
    isCleanAccount: false,
    passwordHash: "01234",
  },
];

export function authenticate(identifier: string, pass: string): UserAccount | null {
  const cleanId = identifier.trim().toLowerCase();
  const found = REGISTERED_ACCOUNTS.find(
    (acc) =>
      (acc.email.toLowerCase() === cleanId || acc.id.toLowerCase() === cleanId) &&
      acc.passwordHash === pass.trim()
  );

  if (!found) return null;
  const { passwordHash, ...safeUser } = found;
  return safeUser;
}
