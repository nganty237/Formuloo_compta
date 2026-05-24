// Un utilisateur est toujours rattaché à un Tenant.
export interface User {
    id: string;
    tenantId: string;
    email: string;
    role: 'ADMIN' | 'COMPTABLE' | 'CLIENT';
}