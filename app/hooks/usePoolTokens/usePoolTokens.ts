import { useConfig } from "~/hooks/useConfig";
import { usePaprController } from "~/hooks/usePaprController";
import { erc20TokenToToken } from "~/lib/uniswap";
import { useMemo } from "react";

export function usePoolTokens() {
  const { chainId } = useConfig();
  const { paprToken, underlying, token0IsUnderlying } = usePaprController();

  const { token0, token1 } = useMemo(() => {
    if (token0IsUnderlying)
      return {
        token0: erc20TokenToToken(underlying, chainId),
        token1: erc20TokenToToken(paprToken, chainId),
      };
    else
      return {
        token0: erc20TokenToToken(paprToken, chainId),
        token1: erc20TokenToToken(underlying, chainId),
      };
  }, [token0IsUnderlying, underlying, paprToken, chainId]);

  return {
    token0,
    token1,
  };
}
