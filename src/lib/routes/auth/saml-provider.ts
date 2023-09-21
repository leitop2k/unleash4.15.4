const SamlStrategy = require('passport-saml').Strategy;
const passport = require('passport');

import { Response } from 'express';
import { OpenApiService } from '../../services/openapi-service';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../server-impl';
import UserService from '../../services/user-service';
import SettingService from '../../services/setting-service';
import { IUnleashServices } from '../../types';
import { SamlAuthSettings } from '../../types/settings/saml-auth-settings';
import { NONE } from '../../types/permissions';
import Controller from '../controller';

type Request = {
    user: {
        email: string;
        firstname: string;
        lastname: string;
        username: string;
        groups: string[];
    };
    session: {
        user: {};
    };
};

export class SamlProvider extends Controller {
    private logger: Logger;

    private openApiService: OpenApiService;

    private userService: UserService;

    private settingService: SettingService;

    constructor(
        config: IUnleashConfig,
        {
            userService,
            openApiService,
            settingService,
        }: Pick<
            IUnleashServices,
            'userService' | 'openApiService' | 'settingService'
        >,
    ) {
        super(config);
        this.logger = config.getLogger('/auth/saml-provider.js');
        this.openApiService = openApiService;
        this.userService = userService;
        this.settingService = settingService;

        this.initSamlGPB();

        this.route({
            method: 'get',
            path: '/login',
            handler: passport.authenticate('saml', {
                successRedirect: '/',
                failureRedirect: '/login',
            }),
            permission: NONE,
        });

        const router = this.appRouter();

        router.post(
            '/login/callback',
            passport.authenticate('saml', {
                failureRedirect: '/',
                failureFlash: true,
            }),
            this.loginCallback.bind(this),
        );
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async initSamlGPB() {
        const samlSettings = await this.settingService.get<SamlAuthSettings>(
            'saml.gpb',
        );

        passport.use(
            new SamlStrategy(
                {
                    callbackUrl: samlSettings.domain,
                    path: samlSettings.path,
                    entryPoint: samlSettings.entryPoint,
                    issuer: samlSettings.issuer,
                    cert: samlSettings.certificate, // cert must be provided
                },
                function (profile, done) {
                    return done(null, profile.attributes);
                },
            ),
        );

        passport.serializeUser(function (user, done) {
            done(null, user);
        });

        passport.deserializeUser(function (user, done) {
            done(null, user);
        });
    }

    async loginCallback(req: Request, res: Response): Promise<void> {
        const { email, firstname, lastname, username, groups } = req.user;

        const user = await this.userService.loginUserSSO({
            email,
            name: `${firstname} ${lastname}`,
            autoCreate: true,
            lastname,
            firstname,
            username,
            groups,
        });

        req.session.user = user;
        this.logger.info(
            `User ${username} (${email}) authenticated successfully`,
        );
        res.redirect('/features?sort=createdAt');
    }
}
