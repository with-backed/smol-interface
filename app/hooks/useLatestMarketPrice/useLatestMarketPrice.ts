import { Token } from "@uniswap/sdk-core";
import { tickToPrice } from "@uniswap/v3-sdk";
import { useConfig } from "~/hooks/useConfig";
import { useEffect, useMemo } from "react";
import { useQuery } from "urql";
import { graphql } from "~/gql/uniswap";
import { usePaprController } from "~/hooks/usePaprController";

graphql(`
  fragment allPoolProperties on Pool {
    feeTier
    liquidity
    volumeUSD
    feesUSD
    totalValueLockedUSD
    tick
    token0 {
      id
      decimals
      symbol
      name
    }
    token1 {
      id
      decimals
      symbol
      name
    }
  }
`);

const poolByIdQuery = graphql(`
  query poolById($id: ID!) {
    pool(id: $id) {
      ...allPoolProperties
    }
  }
`);

export function useLatestMarketPrice() {
  const { chainId, uniswapSubgraph } = useConfig();
  const { poolAddress, token0IsUnderlying } = usePaprController();
  const [{ data }, reExecuteQuery] = useQuery({
    query: poolByIdQuery,
    variables: { id: poolAddress },
    context: useMemo(
      () => ({
        url: uniswapSubgraph,
      }),
      [uniswapSubgraph]
    ),
  });

  useEffect(() => {
    const id = setInterval(
      () => reExecuteQuery({ requestPolicy: "network-only" }),
      1000 * 60 * 2
    );
    return () => clearInterval(id);
  }, [reExecuteQuery]);

  const token0 = useMemo(() => {
    if (!data || !data.pool) {
      return null;
    }
    return new Token(
      chainId,
      data.pool.token0.id,
      parseInt(data.pool.token0.decimals)
    );
  }, [chainId, data]);

  const token1 = useMemo(() => {
    if (!data || !data.pool) {
      return null;
    }
    return new Token(
      chainId,
      data.pool.token1.id,
      parseInt(data.pool.token1.decimals)
    );
  }, [chainId, data]);

  const price = useMemo(() => {
    if (!data || !data.pool || !token0 || !token1) {
      return null;
    }

    const [baseToken, quoteToken] = token0IsUnderlying
      ? [token1, token0]
      : [token0, token1];

    const uniswapPrice = tickToPrice(
      baseToken,
      quoteToken,
      parseInt(data.pool.tick || 0)
    );
    return parseFloat(uniswapPrice.toFixed(4));
  }, [data, token0, token0IsUnderlying, token1]);

  return price;
}
