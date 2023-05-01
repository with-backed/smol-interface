import { useMemo } from "react";
import { usePaprController } from "../usePaprController";
import type { SubgraphVault } from "../useVault";
import { useLoan } from "../useLoan";
import { ethers } from "ethers";
import { formatBigNum } from "~/lib/numberFormat";

export function useAuctionDetails(vault: NonNullable<SubgraphVault>) {
  const { paprToken, underlying } = usePaprController();
  const auction = useMemo(() => {
    return vault.pastAuctions.sort(
      (a, b) => b.end!.timestamp - a.end!.timestamp
    )[0];
  }, [vault.pastAuctions]);

  const loanDetails = useLoan(vault);
  const latestMarketPrice = 1.001; // TODO:adamgobes import useLatestMarketPrice from .wtf

  const auctionProceedsInETH = useMemo(() => {
    if (!loanDetails.vaultDebt || !loanDetails.borrowedPapr) return null;
    // TODO:adamgobes - this is not always correct, need to think through more
    const auctionProceeds = loanDetails.borrowedPapr.sub(loanDetails.vaultDebt);
    // convert the proceeds in papr to the eth naively using the latest market price (although this is not a true quote, its a fine approximation)
    return ethers.utils.parseUnits(
      (
        parseFloat(
          ethers.utils.formatUnits(auctionProceeds, paprToken.decimals)
        ) * latestMarketPrice
      ).toFixed(6),
      underlying.decimals
    );
  }, [
    loanDetails.vaultDebt,
    loanDetails.borrowedPapr,
    paprToken.decimals,
    underlying.decimals,
  ]);
  const formattedProceeds = useMemo(() => {
    if (!auctionProceedsInETH) return "...";
    return `${formatBigNum(auctionProceedsInETH, underlying.decimals)} ${
      underlying.symbol
    }`;
  }, [auctionProceedsInETH, underlying]);

  // compute interest manually by doing repayment + proceeds - borrowed
  // interest is the cost of what they would have to repay compared to what they borrowed while factoring in their auction proceeds
  const interest = useMemo(() => {
    if (
      !loanDetails.repaymentQuote ||
      !loanDetails.borrowedUnderlying ||
      !auctionProceedsInETH
    )
      return null;
    return loanDetails.repaymentQuote
      .add(auctionProceedsInETH)
      .sub(loanDetails.borrowedUnderlying);
  }, [
    loanDetails.repaymentQuote,
    loanDetails.borrowedUnderlying,
    auctionProceedsInETH,
  ]);
  const formattedInterest = useMemo(() => {
    if (!interest) return "...";
    return `${formatBigNum(interest, underlying.decimals)} ${
      underlying.symbol
    }`;
  }, [interest, underlying]);

  return {
    auction,
    auctionProceedsInETH,
    formattedProceeds,
    interest,
    formattedInterest,
    loanDetails,
  };
}
