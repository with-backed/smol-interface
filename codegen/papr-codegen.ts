import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    "app/gql/": {
      schema:
        "https://api.goldsky.com/api/public/project_cl9fqfatx1kql0hvkak9eesug/subgraphs/papr/0.2.04/gn",
      documents: [
        "app/**/*.{ts,tsx}",
        "!app/hooks/useAccountNFTs/useAccountNFTs.ts",
        "!app/routes/tokens/$token/twabs/**/*.{ts,tsx}",
        "!app/hooks/useLatestMarketPrice/useLatestMarketPrice.ts",
      ],
      preset: "client",
      plugins: [],
      presetConfig: {
        fragmentMasking: false,
      },
    },
    "app/gql/twabs/": {
      schema: [
        {
          "https://optimal-mole-21.hasura.app/v1/graphql": {
            headers: { "x-hasura-admin-secret": process.env.HASURA_ADMIN_KEY! },
          },
        },
      ],
      documents: "app/routes/tokens/$token/twabs/**/*.{ts,tsx}",
      preset: "client",
      plugins: [],
      presetConfig: {
        fragmentMasking: false,
      },
    },
    "app/gql/uniswap/": {
      schema: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
      documents: "app/hooks/useLatestMarketPrice/useLatestMarketPrice.ts",
      preset: "client",
      plugins: [],
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
};

export default config;
