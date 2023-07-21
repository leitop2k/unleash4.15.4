import { NONE } from '../../types/permissions';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Request, Response } from 'express';
import Controller from '../controller';
import { Logger } from '../../logger';
import RoleService from 'lib/services/role-service';

export default class RolesController extends Controller {
    private roleService: RoleService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        { roleService }: Pick<IUnleashServices, 'roleService'>,
    ) {
        super(config);
        this.logger = config.getLogger('routes/admin-api/role');
        this.roleService = roleService;

        this.route({
            path: '/:roleId',
            method: 'get',
            handler: this.getRole,
            permission: NONE,
        });
    }

    async getRole(req: Request, res: Response): Promise<void> {
        const { roleId } = req.params;

        const roleWithPermittions =
            await this.roleService.getRoleWithPermittions(Number(roleId));

        res.status(200).json(roleWithPermittions);
    }
}
module.exports = RolesController;
