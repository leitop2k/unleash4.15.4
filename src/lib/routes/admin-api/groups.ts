import { NONE } from '../../types/permissions';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import { Request, Response } from 'express';
import Controller from '../controller';
import { Logger } from '../../logger';
import { GroupService } from 'lib/services/group-service';
import { IGroup, IGroupModel } from 'lib/types/group';

export default class GroupsController extends Controller {
    private groupService: GroupService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        { groupService }: Pick<IUnleashServices, 'groupService'>,
    ) {
        super(config);
        this.logger = config.getLogger('routes/admin-api/groups');
        this.groupService = groupService;

        this.route({
            method: 'get',
            path: '/',
            handler: this.getAll,
            permission: NONE,
        });

        this.route({
            method: 'get',
            path: '/:groupId',
            handler: this.getGroup,
            permission: NONE,
        });

        this.route({
            method: 'delete',
            path: '/:groupId',
            handler: this.deleteGroup,
            permission: NONE,
        });

        this.route({
            method: 'post',
            path: '/',
            handler: this.createGroup,
            permission: NONE,
        });

        this.route({
            method: 'put',
            path: '/:groupId',
            handler: this.updateGroup,
            permission: NONE,
        });
    }

    async getAll(
        req: Request,
        res: Response<{ groups: IGroupModel[] }>,
    ): Promise<void> {
        const result = await this.groupService.getAll();
        res.status(200).json({ groups: result });
    }

    async getGroup(
        req: Request<{ groupId: string }>,
        res: Response<IGroupModel>,
    ): Promise<void> {
        const { groupId } = req.params;
        const result = await this.groupService.getGroup(+groupId);
        res.status(200).json(result);
    }

    async deleteGroup(
        req: Request<{ groupId: string }>,
        res: Response,
    ): Promise<void> {
        const { groupId } = req.params;
        await this.groupService.deleteGroup(+groupId);
        res.status(200).send();
    }

    async createGroup(
        req: Request<
            unknown,
            unknown,
            { name: string; description: string; users: { id: number }[] }
        >,
        res: Response<IGroup>,
    ): Promise<void> {
        // @ts-ignore
        const createdBy = req.user.username || req.user.name;
        // @ts-ignore
        const result = await this.groupService.createGroup(req.body, createdBy);
        res.status(200).send(result);
    }

    async updateGroup(
        req: Request<
            { groupId: string },
            unknown,
            { name: string; description: string; users: { id: number }[] }
        >,
        res: Response<IGroup>,
    ): Promise<void> {
        const { groupId } = req.params;
        // @ts-ignore
        const createdBy = req.user.username || req.user.name;
        // @ts-ignore
        const result = await this.groupService.updateGroup(
            // @ts-ignore
            { ...req.body, id: +groupId },
            createdBy,
        );
        res.status(200).send(result);
    }
}
module.exports = GroupsController;
