import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';
import {
    IAccessStore,
    IRoleWithPermissions,
} from 'lib/types/stores/access-store';
import { IRoleStore } from 'lib/types/stores/role-store';

class RoleService {
    private accessStore: IAccessStore;

    private roleStore: IRoleStore;

    private logger: Logger;

    constructor(
        {
            accessStore,
            roleStore,
        }: Pick<IUnleashStores, 'accessStore' | 'roleStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.accessStore = accessStore;
        this.roleStore = roleStore;
        this.logger = getLogger('services/role-service.ts');
    }

    async getRoleWithPermittions(id: number): Promise<IRoleWithPermissions> {
        const role = await this.roleStore.get(id);
        const permissions = await this.accessStore.getPermissionsForRole(id);

        return {
            ...role,
            permissions: permissions,
        };
    }
}

export default RoleService;
module.exports = RoleService;
