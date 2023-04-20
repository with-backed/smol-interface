import { useMemo } from "react";
import type { Auction } from "~/gql/graphql";
import { useLoan } from "~/hooks/useLoan";
import { Repay } from "../Repay";
import type { VaultWithRiskLevel } from "~/lib/globalStore";

type OngoingAuctionWithRepayProps = {
  auction: Auction;
  vault: NonNullable<VaultWithRiskLevel>;
};

export function OngoingAuctionWithRepay({
  auction,
  vault,
}: OngoingAuctionWithRepayProps) {
  const vaultHasCollateral = useMemo(() => {
    return vault.collateral.length > 0;
  }, [vault.collateral]);

  const loanDetails = useLoan(vault);

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
            <p>{loanDetails.formattedInterest}</p>
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
          You waited too long and your loan has started a liquidation on tokenID{" "}
          #{auction.auctionAssetID}! The proceeds will pay down debt and you
          will receive any excess.
        </p>
      </div>
      {vaultHasCollateral && (
        <Repay vault={vault} loanDetails={loanDetails} refresh={() => null} />
      )}
    </div>
  );
}
