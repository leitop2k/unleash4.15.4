const SamlStrategy = require('passport-saml').Strategy;
const passport = require('passport');
import { Response } from 'express';
import { OpenApiService } from '../../services/openapi-service';
import { Logger } from '../../logger';
import { IUnleashConfig } from '../../server-impl';
import UserService from '../../services/user-service';
import { IUnleashServices } from '../../types';
import { NONE } from '../../types/permissions';
import Controller from '../controller';

type Request = {
    user: {
        email: string;
        firstname: string;
        lastname: string;
        username: string;
    };
    session: {
        user: {};
    };
};

console.log('process.env.KEYCLOAK_DOMAIN', process.env.KEYCLOAK_DOMAIN);
console.log('process.env.PATH', process.env.PATH);
console.log(
    'process.env.KEYCLOAK_ENTRY_POINT',
    process.env.KEYCLOAK_ENTRY_POINT,
);
console.log('process.env.KEYCLOAK_ISSUER', process.env.KEYCLOAK_ISSUER);
console.log('process.env.KEYCLOAK_CERT', process.env.KEYCLOAK_CERT);

passport.use(
    new SamlStrategy(
        {
            callbackUrl: process.env.KEYCLOAK_DOMAIN,
            path: process.env.PATH,
            entryPoint: process.env.KEYCLOAK_ENTRY_POINT,
            issuer: process.env.KEYCLOAK_ISSUER,
            cert: process.env.KEYCLOAK_CERT, // cert must be provided
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

export class SamlProvider extends Controller {
    private logger: Logger;

    private openApiService: OpenApiService;

    private userService: UserService;

    constructor(
        config: IUnleashConfig,
        {
            userService,
            openApiService,
        }: Pick<IUnleashServices, 'userService' | 'openApiService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/auth/saml-provider.js');
        this.openApiService = openApiService;
        this.userService = userService;

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

    async loginCallback(req: Request, res: Response): Promise<void> {
        const { email, firstname, lastname, username } = req.user;

        const user = await this.userService.loginUserSSO({
            email,
            name: `${firstname} ${lastname}`,
            autoCreate: true,
            lastname,
            firstname,
            username,
        });
        req.session.user = user;
        res.redirect('/features?sort=createdAt');
    }
}
