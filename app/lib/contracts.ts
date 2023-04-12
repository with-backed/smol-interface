import { ethers } from "ethers";
import { IQuoter__factory } from "types/generated/abis";

import { configs, SupportedToken } from "./config";

export function makeProvider(jsonRpcProvider: string, token: SupportedToken) {
  return new ethers.providers.JsonRpcProvider(
    jsonRpcProvider,
    configs[token].chainId
  );
}

export function Quoter(jsonRpcProvider: string, token: SupportedToken) {
  const provider = makeProvider(jsonRpcProvider, token);
  return IQuoter__factory.connect(window.ENV.QUOTER, provider);
}
