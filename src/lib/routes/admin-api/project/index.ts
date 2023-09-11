import { Request, Response } from 'express';
import Controller from '../../controller';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types/services';
import ProjectFeaturesController from './features';
import EnvironmentsController from './environments';
import ProjectHealthReport from './health-report';
import ProjectService from '../../../services/project-service';
import VariantsController from './variants';
import { NONE } from '../../../types/permissions';
import {
    projectsSchema,
    ProjectsSchema,
} from '../../../openapi/spec/projects-schema';
import { OpenApiService } from '../../../services/openapi-service';
import { serializeDates } from '../../../types/serialize-dates';
import { createResponseSchema } from '../../../openapi/util/create-response-schema';
import ProjectAccessController from './access';

export default class ProjectApi extends Controller {
    private projectService: ProjectService;

    private openApiService: OpenApiService;

    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);
        this.projectService = services.projectService;
        this.openApiService = services.openApiService;

        this.route({
            path: '',
            method: 'get',
            handler: this.getProjects,
            permission: NONE,
            middleware: [
                services.openApiService.validPath({
                    tags: ['Projects'],
                    operationId: 'getProjects',
                    responses: {
                        200: createResponseSchema('projectsSchema'),
                    },
                }),
            ],
        });

        this.route({
            path: '',
            method: 'post',
            handler: this.createProject,
            permission: NONE,
        });

        this.route({
            path: '/:projectId',
            method: 'put',
            handler: this.updateProject,
            permission: NONE,
        });

        this.route({
            path: '/:projectId',
            method: 'delete',
            handler: this.deleteProject,
            permission: NONE,
        });

        this.use('/', new ProjectAccessController(config, services).router);
        this.use('/', new ProjectFeaturesController(config, services).router);
        this.use('/', new EnvironmentsController(config, services).router);
        this.use('/', new ProjectHealthReport(config, services).router);
        this.use('/', new VariantsController(config, services).router);
    }

    async getProjects(
        req: Request,
        res: Response<ProjectsSchema>,
    ): Promise<void> {
        const projects = await this.projectService.getProjects({
            //id: 'default',
        });

        this.openApiService.respondWithValidation(
            200,
            res,
            projectsSchema.$id,
            { version: 1, projects: serializeDates(projects) },
        );
    }

    async createProject(req: Request, res: Response): Promise<void> {
        const newProject = await this.projectService.createProject(
            req.body,
            // @ts-ignore
            req.user,
        );

        res.status(200).json(newProject);
    }

    async updateProject(req: Request, res: Response): Promise<void> {
        const newProject = await this.projectService.updateProject(
            req.body,
            // @ts-ignore
            req.user,
        );

        res.status(200).json(newProject);
    }

    async deleteProject(req: Request, res: Response): Promise<void> {
        const { projectId } = req.params;
        const newProject = await this.projectService.deleteProject(
            projectId,
            // @ts-ignore
            req.user,
        );

        res.status(200).json(newProject);
    }
}
