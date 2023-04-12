import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { quoterABI, quoterAddress } from "types/generatedABI";
import { useContract, useProvider } from "wagmi";

type UsePoolQuoteParams = {
  amount: ethers.BigNumber;
  inputToken: string;
  outputToken: string;
  tradeType: "exactIn" | "exactOut";
  skip?: boolean;
};

export const FEE_TIER = 10000;

export function usePoolQuote({
  amount,
  inputToken,
  outputToken,
  tradeType,
  skip,
}: UsePoolQuoteParams) {
  const provider = useProvider();
  const [quote, setQuote] = useState<ethers.BigNumber | null>(null);

  const contract = useContract({
    abi: quoterABI,
    address: quoterAddress[1],
    signerOrProvider: provider,
  });

  useEffect(() => {
    const fetchQuote = async () => {
      if (!contract || !amount) return null;
      if (tradeType === "exactIn") {
        const q = await contract.callStatic.quoteExactInputSingle(
          inputToken as `0x${string}`,
          outputToken as `0x${string}`,
          FEE_TIER,
          amount,
          ethers.BigNumber.from(0)
        );
        return ethers.BigNumber.from(q);
      } else {
        const q = await contract.callStatic.quoteExactOutputSingle(
          inputToken as `0x${string}`,
          outputToken as `0x${string}`,
          FEE_TIER,
          amount,
          ethers.BigNumber.from(0)
        );
        return ethers.BigNumber.from(q);
      }
    };
    if (!skip) fetchQuote().then((quote) => setQuote(quote));
  }, [amount, inputToken, outputToken, tradeType, skip, contract]);

  return quote;
}
