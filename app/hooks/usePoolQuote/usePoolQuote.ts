import { ethers } from "ethers";
import { SupportedToken } from "~/lib/config";
import { useEffect, useState } from "react";
import { Erc20Token } from "~/gql/graphql";
import {
  QuoterResult,
  getQuoteForSwap,
  getQuoteForSwapOutput,
  nullQuoteResult,
} from "~/lib/uniswap";

type UsePoolQuoteParams = {
  amount: ethers.BigNumber | undefined;
  inputToken: Erc20Token;
  outputToken: Erc20Token;
  tradeType: "exactIn" | "exactOut";
  skip?: boolean;
};

export function usePoolQuote({
  amount,
  inputToken,
  outputToken,
  tradeType,
  skip,
}: UsePoolQuoteParams) {
  const [quoteResult, setQuoteResult] = useState<QuoterResult>(nullQuoteResult);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!amount) return nullQuoteResult;

      if (tradeType === "exactIn") {
        return await getQuoteForSwap(
          amount,
          inputToken.id,
          outputToken.id,
          window.ENV.TOKEN as SupportedToken
        );
      } else {
        return await getQuoteForSwapOutput(
          amount,
          inputToken.id,
          outputToken.id,
          window.ENV.TOKEN as SupportedToken
        );
      }
    };
    if (!skip) fetchQuote().then((quote) => setQuoteResult(quote));
  }, [amount, inputToken, outputToken, tradeType, skip]);

  return quoteResult;
}
