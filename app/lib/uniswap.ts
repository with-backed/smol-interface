import { Price, Token } from "@uniswap/sdk-core";
import { ethers } from "ethers";
import type { Erc20Token } from "~/gql/graphql";

export const Q96 = ethers.BigNumber.from(2).pow(96);
export const Q192 = Q96.pow(2);

export function price(
  sqrtPriceX96: ethers.BigNumber,
  baseCurrency: Token,
  quoteCurrency: Token,
  token0: Token
): Price<Token, Token> {
  return new Price(
    baseCurrency,
    quoteCurrency,
    token0.address !== quoteCurrency.address
      ? Q192.toString()
      : sqrtPriceX96.mul(sqrtPriceX96).toString(),
    token0.address === quoteCurrency.address
      ? Q192.toString()
      : sqrtPriceX96.mul(sqrtPriceX96).toString()
  );
}

export function erc20TokenToToken(token: Erc20Token, chainId: number): Token {
  return new Token(chainId, token.id, token.decimals, token.symbol, token.name);
}
