export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COMPTABLE' | 'CLIENT';

export interface User {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  role: UserRole;
  tenantId: string | null;
  companyId?: string; // ID de l'entreprise rattachée pour le rôle CLIENT
}
