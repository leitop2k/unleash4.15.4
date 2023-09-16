import React, { useContext, useEffect, useState } from 'react';
import { Button, FormControlLabel, Grid, Switch, TextField } from "@mui/material";
import { Alert } from '@mui/material';
import { PageContent } from 'component/common/PageContent/PageContent';
import AccessContext from 'contexts/AccessContext';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import useToast from 'hooks/useToast';
import useAuthSettings from 'hooks/api/getters/useAuthSettings/useAuthSettings';
import useAuthSettingsApi from 'hooks/api/actions/useAuthSettingsApi/useAuthSettingsApi';
import { formatUnknownError } from 'utils/formatUnknownError';
import { removeEmptyStringFields } from 'utils/removeEmptyStringFields';

const initialState = {
    entryPoint: '',
    path: '',
    domain: '',
    issuer: '',
    certificate: '',
};

export const SamlAuthGPB = () => {
    const { setToastData, setToastApiError } = useToast();
    const [data, setData] = useState(initialState);
    const { hasAccess } = useContext(AccessContext);
    const { config } = useAuthSettings('saml-gpb');
    const { updateSettings, errors, loading } = useAuthSettingsApi('saml-gpb');

    useEffect(() => {
        if (config.entryPoint) {
            setData(config);
        }
    }, [config]);

    if (!hasAccess(ADMIN)) {
        return (
            <Alert severity="error">
                You need to be a root admin to access this section.
            </Alert>
        );
    }

    const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.name, event.target.value);
    };

    const setValue = (name: string, value: string | boolean) => {
        setData({
            ...data,
            [name]: value,
        });
    };

    const onSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();

        try {
            await updateSettings(removeEmptyStringFields(data));
            setToastData({
                title: 'Settings stored',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    return (
        <PageContent>
            <form onSubmit={onSubmit}>
                <Grid container spacing={3}>
                    <Grid item md={5} mb={2}>
                        <strong>Enable</strong>
                        <p>Enable SAML GPB Authentication.</p>
                    </Grid>
                    <Grid item md={6}>
                        <FormControlLabel
                            control={<Switch value={true} name="enabled" checked />}
                            label="Enabled"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Entry Point</strong>
                        <p>(Required) The Entity Identity provider issuer.</p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Entry Point"
                            name="entryPoint"
                            value={data.entryPoint}
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Path</strong>
                        <p>
                            (Required) Callback URL.
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Path"
                            name="path"
                            value={data.path}
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Domain</strong>
                        <p>
                            (Required) Keycloak URL.
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Domain"
                            name="domain"
                            value={data.domain}
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={2}>
                    <Grid item md={5}>
                        <strong>Issuer</strong>
                        <p>
                            (Required) Keycloak Issuer.
                        </p>
                    </Grid>
                    <Grid item md={6}>
                        <TextField
                            onChange={updateField}
                            label="Issuer"
                            name="issuer"
                            value={data.issuer}
                            style={{ width: '400px' }}
                            variant="outlined"
                            size="small"
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3} mb={4}>
                    <Grid item md={5}>
                        <strong>X.509 Certificate</strong>
                        <p>
                            (Required) The certificate used to sign the SAML 2.0
                            request.
                        </p>
                    </Grid>
                    <Grid item md={7}>
                        <TextField
                            onChange={updateField}
                            label="X.509 Certificate"
                            name="certificate"
                            value={data.certificate}
                            style={{ width: '100%' }}
                            InputProps={{
                                style: {
                                    fontSize: '0.6em',
                                    fontFamily: 'monospace',
                                },
                            }}
                            multiline
                            rows={14}
                            maxRows={14}
                            variant="outlined"
                            size="small"
                            required
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={3}>
                    <Grid item md={5}>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={loading}
                        >
                            Save
                        </Button>{' '}
                        <p>
                            <small style={{ color: 'red' }}>
                                {errors?.message}
                            </small>
                        </p>
                    </Grid>
                </Grid>
            </form>
        </PageContent>
    );
};
