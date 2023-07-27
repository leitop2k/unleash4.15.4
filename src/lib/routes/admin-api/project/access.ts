import { Request, Response } from 'express';
import Controller from '../../controller';
import { IUnleashServices } from '../../../types/services';
import { IUnleashConfig } from '../../../types/option';
import { Logger } from '../../../logger';
import { NONE } from '../../../types/permissions';
import { ProjectAccessSchema } from '../../../openapi/spec/project-access-schema';
import { AccessService } from 'lib/services/access-service';
import { IProjectAccessModel } from 'lib/types/stores/access-store';

export default class ProjectAccessController extends Controller {
    private accessService: AccessService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        { accessService }: Pick<IUnleashServices, 'accessService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/project/access');
        this.accessService = accessService;

        this.route({
            path: '/:projectId/access',
            method: 'get',
            handler: this.getProjectAccess,
            permission: NONE,
        });

        this.route({
            path: '/:projectId/role/:roleId/access',
            method: 'post',
            handler: this.addAccessToProject,
            permission: NONE,
        });

        this.route({
            path: '/:projectId/groups/:groupId/roles/:roleId',
            method: 'delete',
            handler: this.deleteGroupWithRoleFromProject,
            permission: NONE,
        });

        this.route({
            path: '/:projectId/users/:userId/roles/:roleId',
            method: 'delete',
            handler: this.deleteUserWithRoleFromProject,
            permission: NONE,
        });

        this.route({
            path: '/:projectId/groups/:groupId/roles/:roleId',
            method: 'put',
            handler: this.updateGroupWithRoleForProject,
            permission: NONE,
        });

        this.route({
            path: '/:projectId/users/:userId/roles/:roleId',
            method: 'put',
            handler: this.updateUserRoleForProject,
            permission: NONE,
        });
    }

    async getProjectAccess(
        req: Request,
        res: Response<ProjectAccessSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const response = await this.accessService.getProjectRoleAccess(
            projectId,
        );
        res.status(200).json({
            roles: response[0],
            users: response[1],
            groups: response[2],
        });
    }

    async addAccessToProject(
        req: Request<
            { projectId: string; roleId: string },
            unknown,
            IProjectAccessModel,
            unknown
        >,
        res: Response<void>,
    ): Promise<void> {
        const { projectId, roleId } = req.params;
        const { users, groups } = req.body;
        // @ts-ignore
        const createdBy = req.user.username || req.user.name;

        await this.accessService.addAccessToProject(
            users,
            groups,
            projectId,
            +roleId,
            createdBy,
        );

        res.status(200).send();
    }

    async deleteGroupWithRoleFromProject(
        req: Request<
            { projectId: string; groupId: string; roleId: string },
            unknown,
            IProjectAccessModel,
            unknown
        >,
        res: Response<void>,
    ): Promise<void> {
        const { projectId, groupId, roleId } = req.params;
        await this.accessService.removeGroupFromRole(
            Number(groupId),
            Number(roleId),
            projectId,
        );
        res.status(200).send();
    }

    async deleteUserWithRoleFromProject(
        req: Request<
            { projectId: string; userId: string; roleId: string },
            unknown,
            IProjectAccessModel,
            unknown
        >,
        res: Response<void>,
    ): Promise<void> {
        const { projectId, userId, roleId } = req.params;
        await this.accessService.removeUserFromRole(
            Number(userId),
            Number(roleId),
            projectId,
        );
        res.status(200).send();
    }

    async updateGroupWithRoleForProject(
        req: Request<
            { projectId: string; groupId: string; roleId: string },
            unknown,
            IProjectAccessModel,
            unknown
        >,
        res: Response<void>,
    ): Promise<void> {
        const { projectId, groupId, roleId } = req.params;
        await this.accessService.updateGroupProjectRole(
            Number(groupId),
            Number(roleId),
            projectId,
        );
        res.status(200).send();
    }

    async updateUserRoleForProject(
        req: Request<
            { projectId: string; userId: string; roleId: string },
            unknown,
            IProjectAccessModel,
            unknown
        >,
        res: Response<void>,
    ): Promise<void> {
        const { projectId, userId, roleId } = req.params;
        await this.accessService.updateUserProjectRole(
            Number(userId),
            Number(roleId),
            projectId,
        );
        res.status(200).send();
    }
}
