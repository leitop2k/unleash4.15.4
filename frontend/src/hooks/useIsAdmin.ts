import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';

export const useIsAdmin = () => {
    const { isAdmin } = useContext(AccessContext);
    return isAdmin;
};
