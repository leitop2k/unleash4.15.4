import { FromSchema } from 'json-schema-to-ts';
import { userSchema } from './user-schema';
import { roleSchema } from './role-schema';
import { groupSchema } from './group-schema';

export const projectAccessSchema = {
    $id: '#/components/schemas/projectAccessSchema',
    type: 'object',
    additionalProperties: false,
    required: [],
    properties: {
        users: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/userSchema',
            },
        },
        roles: {
            type: 'array',
            items: {
                $ref: '#/components/schemas/roleSchema',
            },
        },
        groups: {
            type: 'array',
            // [TODO]: найти тип
            // items: {
            //     $ref: '#/components/schemas/groupSchema',
            // },
        },
    },
    components: {
        schemas: {
            userSchema,
            roleSchema,
            groupSchema,
        },
    },
} as const;

export type ProjectAccessSchema = FromSchema<typeof projectAccessSchema>;
