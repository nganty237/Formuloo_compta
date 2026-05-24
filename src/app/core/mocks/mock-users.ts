import { User } from '../models/user.model';

export const MOCK_USERS: User[] = [
    { id: 'user-1', tenantId: 'tenant-1', email: 'admin@audit-co.ci', role: 'ADMIN' },
    { id: 'user-2', tenantId: 'tenant-1', email: 'jean@audit-co.ci', role: 'COMPTABLE' },
    { id: 'user-3', tenantId: 'tenant-2', email: 'client@senegal-expertise.sn', role: 'CLIENT' }
];