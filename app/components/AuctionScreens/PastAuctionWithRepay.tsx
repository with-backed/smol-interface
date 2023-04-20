import { ethers } from "ethers";
import { useMemo } from "react";
import { useLoan } from "~/hooks/useLoan";
import { usePaprController } from "~/hooks/usePaprController";
import type { VaultWithRiskLevel } from "~/lib/globalStore";
import { formatBigNum } from "~/lib/numberFormat";
import { Repay } from "../Repay";

type PastAuctionWithRepayProps = {
  vault: NonNullable<VaultWithRiskLevel>;
};

export function PastAuctionWithRepay({ vault }: PastAuctionWithRepayProps) {
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
    const auctionProceeds = loanDetails.borrowedPapr.sub(loanDetails.vaultDebt);
    return ethers.utils.parseUnits(
      (
        parseFloat(
          ethers.utils.formatUnits(auctionProceeds, paprToken.decimals)
        ) * latestMarketPrice
      ).toString(),
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

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-initial flex flex-col p-6">
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Borrowed:</p>
          </div>
          <div>
            <p>{loanDetails.formattedBorrowed}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Cost:</p>
          </div>
          <div>
            <p>{formattedInterest}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Auction proceeds:</p>
          </div>
          <div>
            <p>{formattedProceeds}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Total Repayment:</p>
          </div>
          <div>
            <p>{loanDetails.formattedTotalRepayment}</p>
          </div>
        </div>
      </div>
      <div>
        <p>
          You waited too long and tokenID #{auction.auctionAssetID} was sold at
          a liquidation auction! The proceeds have been used to pay down your
          debt
        </p>
      </div>
      <Repay vault={vault} loanDetails={loanDetails} refresh={() => null} />
    </div>
  );
}
