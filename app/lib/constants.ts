export const APP_NAME = "paprSMOOTHBRAIN";
export const MAINNET_CONTROLLER_ID =
  "0x3b29c19ff2fcea0ff98d0ef5b184354d74ea74b0";

export const SECONDS_IN_A_DAY = 60 * 60 * 24;
export const SECONDS_IN_AN_HOUR = 60 * 60;
export const SECONDS_IN_A_YEAR = 31_536_000;

export const FEE_TIER = 10000;

export const oracleInfoArgEncoded =
  "tuple(tuple(bytes32 id, bytes payload, uint256 timestamp, bytes signature) message, tuple(uint8 v, bytes32 r, bytes32 s) sig) oracleInfo";

export const swapParamsArgEncoded = `tuple(uint256 amount, uint256 minOut, uint160 sqrtPriceLimitX96, address swapFeeTo, uint256 swapFeeBips, uint256 deadline) swapParams`;

// Assuming 12s per block, one day ago is current block number
// minus 7200.
export const BLOCKS_IN_A_DAY = 7200;
