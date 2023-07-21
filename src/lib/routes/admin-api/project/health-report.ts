import { Request, Response } from 'express';
import Controller from '../../controller';
import { IUnleashServices } from '../../../types/services';
import { IUnleashConfig } from '../../../types/option';
import ProjectHealthService from '../../../services/project-health-service';
import { Logger } from '../../../logger';
import { IArchivedQuery, IProjectParam } from '../../../types/model';
import { NONE } from '../../../types/permissions';
import { OpenApiService } from '../../../services/openapi-service';
import { createResponseSchema } from '../../../openapi/util/create-response-schema';
import {
    healthOverviewSchema,
    HealthOverviewSchema,
} from '../../../openapi/spec/health-overview-schema';
import {
    projectAccessSchema,
    ProjectAccessSchema,
} from '../../../openapi/spec/project-access-schema';
import { serializeDates } from '../../../types/serialize-dates';
import {
    healthReportSchema,
    HealthReportSchema,
} from '../../../openapi/spec/health-report-schema';
import { AccessService } from 'lib/services/access-service';
import { IProjectAccessModel } from 'lib/types/stores/access-store';

export default class ProjectHealthReport extends Controller {
    private projectHealthService: ProjectHealthService;

    private openApiService: OpenApiService;

    private accessService: AccessService;

    private logger: Logger;

    constructor(
        config: IUnleashConfig,
        {
            projectHealthService,
            openApiService,
            accessService,
        }: Pick<
            IUnleashServices,
            'projectHealthService' | 'openApiService' | 'accessService'
        >,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/project/health-report');
        this.projectHealthService = projectHealthService;
        this.openApiService = openApiService;
        this.accessService = accessService;

        this.route({
            path: '/:projectId/access',
            method: 'get',
            handler: this.getProjectAccess,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectAccess',
                    responses: {
                        200: createResponseSchema('projectAccessSchema'),
                    },
                }),
            ],
        });

        this.route({
            path: '/:projectId/role/:roleId/access',
            method: 'post',
            handler: this.addAccessToProject,
            permission: NONE,
        });

        this.route({
            method: 'get',
            path: '/:projectId',
            handler: this.getProjectHealthOverview,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectHealthOverview',
                    responses: {
                        200: createResponseSchema('healthOverviewSchema'),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:projectId/health-report',
            handler: this.getProjectHealthReport,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjectHealthReport',
                    responses: {
                        200: createResponseSchema('healthReportSchema'),
                    },
                }),
            ],
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
        this.openApiService.respondWithValidation(
            200,
            res,
            projectAccessSchema.$id,
            { roles: response[0], users: response[1], groups: response[2] },
        );
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
        // [TODO] Пока только user-ов добавляем, без групп (user-group)
        const { users } = req.body;
        // @ts-ignore
        const createdBy = req.user.username || req.user.name;

        await this.accessService.addAccessToProject(
            users,
            [],
            projectId,
            +roleId,
            createdBy,
        );

        res.status(200).send();
    }

    async getProjectHealthOverview(
        req: Request<IProjectParam, unknown, unknown, IArchivedQuery>,
        res: Response<HealthOverviewSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const { archived } = req.query;
        const overview = await this.projectHealthService.getProjectOverview(
            projectId,
            archived,
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            healthOverviewSchema.$id,
            serializeDates(overview),
        );
    }

    async getProjectHealthReport(
        req: Request<IProjectParam>,
        res: Response<HealthReportSchema>,
    ): Promise<void> {
        const { projectId } = req.params;
        const overview = await this.projectHealthService.getProjectHealthReport(
            projectId,
        );
        this.openApiService.respondWithValidation(
            200,
            res,
            healthReportSchema.$id,
            serializeDates(overview),
        );
    }
}
