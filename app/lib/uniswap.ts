import { ethers } from "ethers";
import { SupportedToken, configs } from "./config";
import { Quoter } from "./contracts";

export const ONE = ethers.BigNumber.from(10).pow(18);
export const TICK_SPACING = 200;
export const FEE_TIER = 10000;

export type QuoterResult = {
  quote: ethers.BigNumber | null;
  sqrtPriceX96After: ethers.BigNumber | null;
};

export const nullQuoteResult: QuoterResult = {
  quote: null,
  sqrtPriceX96After: null,
};

export async function getQuoteForSwap(
  amount: ethers.BigNumber,
  tokenIn: string,
  tokenOut: string,
  tokenName: SupportedToken
): Promise<QuoterResult> {
  const quoter = Quoter(configs[tokenName].jsonRpcProvider, tokenName);
  try {
    const q = await quoter.callStatic.quoteExactInputSingle({
      tokenIn,
      tokenOut,
      fee: FEE_TIER,
      amountIn: amount,
      sqrtPriceLimitX96: 0,
    });
    console.log({ q });
    return { quote: q.amountOut, sqrtPriceX96After: q.sqrtPriceX96After };
  } catch (_e) {
    return nullQuoteResult;
  }
}

export async function getQuoteForSwapOutput(
  amount: ethers.BigNumber,
  tokenIn: string,
  tokenOut: string,
  tokenName: SupportedToken
): Promise<QuoterResult> {
  const quoter = Quoter(configs[tokenName].jsonRpcProvider, tokenName);
  try {
    const q = await quoter.callStatic.quoteExactOutputSingle({
      tokenIn,
      tokenOut,
      fee: FEE_TIER,
      amount,
      sqrtPriceLimitX96: 0,
    });
    return { quote: q.amountIn, sqrtPriceX96After: q.sqrtPriceX96After };
  } catch (_e) {
    return nullQuoteResult;
  }
}
