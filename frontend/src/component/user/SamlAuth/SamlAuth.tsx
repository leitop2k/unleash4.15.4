import { VFC } from 'react';
import classnames from 'classnames';
import { Button } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useThemeStyles } from 'themes/themeStyles';
import { useStyles } from './SamlAuth.styles';
import AuthOptions from '../common/AuthOptions/AuthOptions';
import DividerText from 'component/common/DividerText/DividerText';
import { LOGIN_BUTTON } from 'utils/testIds';
import { IAuthEndpointDetailsResponse } from 'hooks/api/getters/useAuth/useAuthEndpoint';

interface ISamlAuthProps {
    authDetails: IAuthEndpointDetailsResponse;
}

const SamlAuth: VFC<ISamlAuthProps> = ({ authDetails }) => {
    const { classes: themeStyles } = useThemeStyles();
    const { classes: styles } = useStyles();

    const renderLoginForm = () => {
        return (
            <ConditionallyRender
                condition={!authDetails.defaultHidden}
                show={
                    <form action="/auth/saml/login" method="get">
                        <div className={classnames(styles.contentContainer, themeStyles.contentSpacingY)}>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                style={{ width: '200px', margin: '1rem auto' }}
                                data-testid={LOGIN_BUTTON}
                            >
                                Sign in Unleash
                            </Button>
                        </div>
                    </form>
                }
            />
        );
    };

    const { options = [] } = authDetails;

    return (
        <>
            <ConditionallyRender
                condition={options.length > 0}
                show={
                    <>
                        <AuthOptions options={options} />
                        <ConditionallyRender
                            condition={!authDetails.defaultHidden}
                            show={
                                <DividerText text="Or sign in with username" />
                            }
                        />
                        {renderLoginForm()}
                    </>
                }
                elseShow={renderLoginForm()}
            />
        </>
    );
};

export default SamlAuth;
