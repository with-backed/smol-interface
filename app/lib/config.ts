const baseConfig = {
  siteUrl: "",
};

export type Config = typeof paprMeme;

export type SupportedToken = keyof typeof configs;
export type SupportedNetwork = "ethereum" | "goerli";

const alchemyId =
  typeof window === "undefined"
    ? process.env.ALCHEMY_KEY
    : window.ENV.ALCHEMY_KEY;

const paprHero: Config = {
  ...baseConfig,
  tokenName: "paprHero",
  centerNetwork: "ethereum-goerli",
  centerKey: "key-43ed0f00c03c-4cf3908a1526",
  chainId: 5,
  jsonRpcProvider: `https://eth-goerli.alchemyapi.io/v2/${alchemyId}`,
  etherscanUrl: "https://goerli.etherscan.io",
  network: "goerli",
  controllerAddress: "0x937968d77f8e312574d659ccd9a527ec063ff601",
  underlyingAddress: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
  paprTokenAddress: "0x7b863de6be0c945a2317af4ed78959da10a7eddc",
  uniswapSubgraph:
    "https://api.thegraph.com/subgraphs/name/liqwiz/uniswap-v3-goerli",
  paprSubgraph:
    "https://api.goldsky.com/api/public/project_cl9fqfatx1kql0hvkak9eesug/subgraphs/papr-goerli/0.1.95/gn",
  reservoirAPI: "https://api-goerli.reservoir.tools",
  erc721Subgraph:
    "https://api.thegraph.com/subgraphs/name/adamgobes/erc721-goerli",
  twabsApi: "https://optimal-mole-21.hasura.app/v1/graphql",
  rustOracleServer:
    "https://papr-api.onrender.com/oracleInfoForAllowedCollateral",
};

const paprMeme = {
  ...baseConfig,
  tokenName: "paprMeme",
  centerNetwork: "ethereum-mainnet",
  centerKey: "quaint-plywood-796b48676dc6",
  etherscanUrl: "https://etherscan.io",
  chainId: 1,
  jsonRpcProvider: `https://eth-mainnet.alchemyapi.io/v2/${alchemyId}`,
  network: "ethereum",
  controllerAddress: "0x3b29c19ff2fcea0ff98d0ef5b184354d74ea74b0",
  underlyingAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  paprTokenAddress: "0x320aaab3038bc08317f5a4be19ea1d9608551d79",
  uniswapSubgraph: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  paprSubgraph:
    "https://api.goldsky.com/api/public/project_cl9fqfatx1kql0hvkak9eesug/subgraphs/papr/0.2.04/gn",
  reservoirAPI: "https://api.reservoir.tools",
  erc721Subgraph:
    "https://api.thegraph.com/subgraphs/name/sunguru98/mainnet-erc721-subgraph",
  twabsApi: "https://optimal-mole-21.hasura.app/v1/graphql",
  rustOracleServer:
    "https://papr-api.onrender.com/oracleInfoForAllowedCollateral",
};

export const configs = {
  paprHero,
  paprMeme,
};
