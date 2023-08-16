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
    user: { email: string; firstname: string; lastname: string };
    session: {
        user: {};
    };
};

passport.use(
    new SamlStrategy(
        {
            callbackUrl: 'https://unleash.nekto-z.ru',
            path: '/auth/saml/login/callback',
            entryPoint:
                'https://keycloak.nekto-z.ru/auth/realms/Test/protocol/saml/clients/unleash',
            issuer: 'unleash',
            cert: 'MIIClzCCAX8CBgGJIE5PGjANBgkqhkiG9w0BAQsFADAPMQ0wCwYDVQQDDARUZXN0MB4XDTIzMDcwNDA5NDczMFoXDTMzMDcwNDA5NDkxMFowDzENMAsGA1UEAwwEVGVzdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAL0PlHcTlD9k3pz19x1UqBCyHV0h/XwE6IPChWybTHKLfTW0OGjhNACCTp4e5Wa8sW54QJvZSq3zVyB7XdRqVxAnCHzvJ4PAZ4GGk7R2dr285CgEj0aUByf3r9wy9P0rdh6Gu1PnWhzCKOJz/c/Qkh+o5kbjGdnToee4bkdbMCnBLphrdHPh+VjpWzPSVYUXcIWhmf7r3y5zIGeWB1loHYuzkl01dMTuDjV3fuKjHonspMd8XYdp3EyQUaL6pZYMOMeCUt3MqX5JuHridHP4gTUNP2RczCwEvgdu3Kts6e9S9nNjTRafS1sov6NCTMlIkK3zSm39QcH7EDS8PMAHRLMCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEALzL6MFOO6W56xqMbuhk5i5z0nV/GNHYbFSkePiiSe5jlbKS9uBxQJaFDbxsZ0N5bmh/3oFdnhbJtBy/CIxOxAFgOGtMExi6jE8WogSKTGtq1NCg5qR7WlFm6RaDncIqrvSRrWgE2LIqk+KP0VnUj1ieftv/n4BWnMoN1gLao9IEUNcO3XR9Sgyhxx2wc0F3ZbEjVLLUSq6NeOromlteuLbaSE1JBElxgIcVrKhwllpqYoqKqIPgpff7wBqzwvgDuIUhWu7SIBJ4lic9oboRCR9tsmV2h1G913jxeSbSgvQV/Kd4WsUOOGbCr506Q3p03sbwvYT3c1eFo1EAXBlcSWQ==', // cert must be provided
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
        const { email, firstname, lastname } = req.user;

        const user = await this.userService.loginUserSSO({
            email,
            name: `${firstname} ${lastname}`,
            autoCreate: true,
        });
        req.session.user = user;
        res.redirect('/features?sort=createdAt');
    }
}
