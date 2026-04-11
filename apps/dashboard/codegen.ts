import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: '../core/src/schema.gql',
    documents: ['app/**/*.tsx', 'app/**/*.ts', 'components/**/*.tsx', 'components/**/*.ts', 'lib/**/*.ts'],
    ignoreNoDocuments: true,
    generates: {
        './lib/gql/': {
            preset: 'client',
        },
    },
};

export default config;
