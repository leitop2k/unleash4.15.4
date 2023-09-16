import { FromSchema } from 'json-schema-to-ts';

export const samlGpbSchema = {
    $id: '#/components/schemas/samlGpbSchema',
    type: 'object',
    additionalProperties: false,
    required: ['entryPoint', 'path', 'domain', 'issuer', 'certificate'],
    properties: {
        entryPoint: {
            type: 'string',
        },
        path: {
            type: 'string',
        },
        domain: {
            type: 'string',
        },
        issuer: {
            type: 'string',
        },
        certificate: {
            type: 'string',
        },
    },
    components: {},
} as const;

export type SamlGpbSchema = FromSchema<typeof samlGpbSchema>;
