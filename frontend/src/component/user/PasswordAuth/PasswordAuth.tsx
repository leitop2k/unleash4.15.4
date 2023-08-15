import TemplatePasswordAuth from './TemplatePasswordAuth';
import useQueryParams from 'hooks/useQueryParams';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { Navigate } from "react-router-dom";
import { parseRedirectParam } from 'component/user/Login/parseRedirectParam';

const PasswordAuth = () => {
    const { user } = useAuthUser();
    const query = useQueryParams();
    const { authDetails } = useAuthDetails();

    const redirect = query.get('redirect') || '/';

    if (user) {
        return <Navigate to={parseRedirectParam(redirect)} replace />;
    }

    if (!authDetails) return null;

    return <TemplatePasswordAuth redirect={redirect} authDetails={authDetails} />;
};

export default PasswordAuth;





