import { useContext } from 'react';
import { IRoute } from 'interfaces/route';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import AccessContext from 'contexts/AccessContext';

const forbiddenForNonAdminsRouteTitles = ['API access'];

export const useFilteredNonAdminRoutes = (routes: IRoute[]) => {
    const { hasAccess } = useContext(AccessContext);
    return routes.filter(route => {
        if (forbiddenForNonAdminsRouteTitles.includes(route.title)) {
            return hasAccess(ADMIN);
        }
        return true;
    });
};
