import { Request, Response } from 'express';
import { IUnleashConfig } from '../../../types/option';
import { IUnleashServices } from '../../../types/services';
import { ADMIN } from '../../../types/permissions';
import Controller from '../../controller';
import { OpenApiService } from '../../../services/openapi-service';
import SettingService from '../../../services/setting-service';
import { samlGpbSchema } from '../../../../lib/openapi/spec/saml-gpb-schema';
import { SamlAuthSettings } from '../../../types/settings/saml-auth-settings';
import { createRequestSchema } from '../../../openapi/util/create-request-schema';
import { emptyResponse } from '../../../openapi/util/standard-responses';

export interface UserRequest extends Request {
    user: {
        email: string;
        firstname: string;
        lastname: string;
        username: string;
        groups: string[];
    };
}

export default class SamlGpbController extends Controller {
    private openApiService: OpenApiService;

    private settingService: SettingService;

    constructor(
        config: IUnleashConfig,
        {
            settingService,
            openApiService,
        }: Pick<IUnleashServices, 'settingService' | 'openApiService'>,
    ) {
        super(config);
        this.settingService = settingService;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '/settings',
            handler: this.getSettings,
            permission: ADMIN,
        });
        this.route({
            method: 'post',
            path: '/settings',
            handler: this.setSettings,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    tags: ['Auth'],
                    operationId: 'changeSamlGPB',
                    requestBody: createRequestSchema('samlGpbSchema'),
                    responses: {
                        200: emptyResponse,
                        400: { description: 'samlGpbMismatch' },
                    },
                }),
            ],
        });
    }

    async getSettings(req: Request, res: Response): Promise<void> {
        const samlSettings = await this.settingService.get<SamlAuthSettings>(
            'saml.gpb',
        );

        this.openApiService.respondWithValidation(
            200,
            res,
            samlGpbSchema.$id,
            samlSettings,
        );
    }

    async setSettings(req: UserRequest, res: Response): Promise<void> {
        try {
            await this.settingService.insert(
                'saml.gpb',
                req.body,
                req.user.username,
            );

            res.status(200).end();
        } catch {
            res.status(400).end();
        }
    }
}
