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

    let auctionProceeds: ethers.BigNumber;

    // if the vault has no more debt, their proceeds were the end price of the most recent auction
    if (loanDetails.vaultDebt.isZero()) auctionProceeds = auction.endPrice;
    // otherwise, the auction proceeds are the difference between what they initially borrowed and the vaults current debt
    else auctionProceeds = loanDetails.borrowedPapr.sub(loanDetails.vaultDebt);

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
    auction.endPrice,
    paprToken.decimals,
    underlying.decimals,
  ]);
  const formattedProceeds = useMemo(() => {
    if (!auctionProceedsInETH) return "...";
    return `${formatBigNum(auctionProceedsInETH, underlying.decimals)} ${
      underlying.symbol
    }`;
  }, [auctionProceedsInETH, underlying]);

  return {
    auction,
    auctionProceedsInETH,
    formattedProceeds,
    loanDetails,
  };
}
