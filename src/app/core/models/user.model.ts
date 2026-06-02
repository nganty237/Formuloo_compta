export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COMPTABLE' | 'CLIENT';

export interface User {
  id: string;
  name?: string;
  email?: string;
  role: UserRole;
  tenantId: string | null;
}
