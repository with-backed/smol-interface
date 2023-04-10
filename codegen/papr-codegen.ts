import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema:
    "https://api.goldsky.com/api/public/project_cl9fqfatx1kql0hvkak9eesug/subgraphs/papr/0.2.02/gn",
  documents: "app/**/*.{ts,tsx}",
  generates: {
    "app/gql/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
