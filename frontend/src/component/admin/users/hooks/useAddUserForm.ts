import { useEffect, useState } from 'react';
import { useUsers } from 'hooks/api/getters/useUsers/useUsers';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const useCreateUserForm = (
    initialName = '',
    initialEmail = '',
    initialRootRole = 1,
    initialFirstname = '',
    initialLastname = ''
) => {
    const { uiConfig } = useUiConfig();
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);
    const [firstname, setFirstname] = useState(initialFirstname);
    const [lastname, setLastname] = useState(initialLastname);
    const [sendEmail, setSendEmail] = useState(false);
    const [rootRole, setRootRole] = useState(initialRootRole);
    const [errors, setErrors] = useState({});

    const { users } = useUsers();

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    useEffect(() => {
        setEmail(initialEmail);
    }, [initialEmail]);

    useEffect(() => {
        setSendEmail(uiConfig?.emailEnabled || false);
    }, [uiConfig?.emailEnabled]);

    useEffect(() => {
        setRootRole(initialRootRole);
    }, [initialRootRole]);

    useEffect(() => {
        setFirstname(initialFirstname);
    }, [initialFirstname]);

    useEffect(() => {
        setLastname(initialLastname);
    }, [initialLastname]);

    const getAddUserPayload = () => {
        return {
            name: name,
            email: email,
            sendEmail: sendEmail,
            rootRole: rootRole,
            firstname: firstname,
            lastname: lastname,
        };
    };

    const validateName = () => {
        if (name.length === 0) {
            setErrors(prev => ({ ...prev, name: 'Name can not be empty.' }));
            return false;
        }
        if (email.length === 0) {
            setErrors(prev => ({ ...prev, email: 'Email can not be empty.' }));
            return false;
        }

        // firstname and lastname are not validating because they are nor required

        return true;
    };

    const validateEmail = () => {
        // @ts-expect-error
        if (users.some(user => user['email'] === email)) {
            setErrors(prev => ({ ...prev, email: 'Email already exists' }));
            return false;
        }
        return true;
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        name,
        setName,
        email,
        setEmail,
        sendEmail,
        setSendEmail,
        rootRole,
        setRootRole,
        firstname,
        setFirstname,
        lastname,
        setLastname,
        getAddUserPayload,
        validateName,
        validateEmail,
        clearErrors,
        errors,
    };
};

export default useCreateUserForm;
