import type { VaultWithRiskLevel } from "~/lib/globalStore";
import { Repay } from "../Repay";
import { useAuctionDetails } from "~/hooks/useAuctionDetails";

type PastAuctionWithRepayProps = {
  vault: NonNullable<VaultWithRiskLevel>;
};

export function PastAuctionWithRepay({ vault }: PastAuctionWithRepayProps) {
  const { auction, loanDetails, formattedInterest, formattedProceeds } =
    useAuctionDetails(vault);

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
      <div className="py-2 px-6">
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
