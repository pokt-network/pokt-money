import type { CodegenConfig } from '@graphql-codegen/cli'
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({
  quiet: true,
});

console.log(`Generating GraphQL code from ${process.env.INDEXER_API_URL}`)

const config: CodegenConfig = {
  schema: process.env.INDEXER_API_URL,
  documents: ['app/**/*.ts*'],
  generates: {
    './app/config/gql/': {
      preset: 'client',
    },
    './schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true
      }
    }
  }
}
export default config
