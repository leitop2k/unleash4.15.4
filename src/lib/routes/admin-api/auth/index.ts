import Controller from '../../controller';
import { IUnleashServices } from '../../../types/services';
import { IUnleashConfig } from '../../../types/option';
import SamlGpbController from './saml-gpb';

class AdminApiAuth extends Controller {
    constructor(config: IUnleashConfig, services: IUnleashServices) {
        super(config);

        this.app.use(
            '/saml-gpb',
            new SamlGpbController(config, services).router,
        );
    }
}

module.exports = AdminApiAuth;
