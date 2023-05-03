import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    "app/gql/": {
      schema:
        "https://api.goldsky.com/api/public/project_cl9fqfatx1kql0hvkak9eesug/subgraphs/papr-goerli/0.1.95/gn",
      documents: [
        "app/**/*.{ts,tsx}",
        "!app/hooks/useAccountNFTs/useAccountNFTs.ts",
        "!app/hooks/useTWAB/useTWAB.ts",
      ],
      preset: "client",
      plugins: [],
      presetConfig: {
        fragmentMasking: false,
      },
    },
    "app/gql/erc721/": {
      schema:
        "https://api.thegraph.com/subgraphs/name/sunguru98/mainnet-erc721-subgraph",
      documents: "app/hooks/useAccountNFTs/useAccountNFTs.ts",
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
      documents: "app/hooks/useTWAB/useTWAB.ts",
      preset: "client",
      plugins: [],
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
};

export default config;
