import { useCallback, useMemo } from "react";
import { useGlobalStore } from "~/lib/globalStore";
import { useLoan } from "~/hooks/useLoan";
import { Repay } from "../Repay";
import type { VaultWithRiskLevel } from "~/lib/globalStore";

type OngoingAuctionWithRepayProps = {
  vault: NonNullable<VaultWithRiskLevel>;
};

export function OngoingAuctionWithRepay({
  vault,
}: OngoingAuctionWithRepayProps) {
  const auction = useMemo(() => {
    return vault.ongoingAuctions[0];
  }, [vault.ongoingAuctions]);

  const vaultHasCollateral = useMemo(() => {
    return vault.collateral.length > 0;
  }, [vault.collateral]);

  const pastAuctions = useMemo(() => {
    return vault.pastAuctions.filter(
      (pa) => pa.end!.timestamp > vault.latestIncreaseDebt
    );
  }, [vault.pastAuctions, vault.latestIncreaseDebt]);

  const auctionedTokenIds = useMemo(() => {
    pastAuctions.map((auction) => `#${auction.auctionAssetID}`).join(", ");
  }, [pastAuctions]);

  const moreThanOneAuctioned = useMemo(() => {
    return vault.pastAuctions.length > 1;
  }, [vault.pastAuctions]);

  const pastAuctionedString = useMemo(() => {
    if (pastAuctions.length === 0) return "";
    return `
    tokenID${moreThanOneAuctioned ? "s" : ""} ${auctionedTokenIds}{" "}
          ${
            moreThanOneAuctioned ? "were" : "was"
          } sold at a liquidation auction!
    `;
  }, [pastAuctions, auctionedTokenIds, moreThanOneAuctioned]);

  const loanDetails = useLoan(vault);

  const hasRepaidAuction = useGlobalStore(
    (s) => s.recentActions[vault.token.id]?.hasRepaid || false
  );
  const setRecentActions = useGlobalStore((s) => s.setRecentActions);
  const setHasRepaidAuction = useCallback(() => {
    setRecentActions((actions) => ({
      ...actions,
      [vault.token.id]: { hasRepaid: true, hasClaimed: false },
    }));
  }, [vault.token.id, setRecentActions]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-initial flex flex-col px-6 py-4">
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
            <p>Total {hasRepaidAuction ? "Repaid" : "Owed"}:</p>
          </div>
          <div>
            <p>{loanDetails.formattedTotalOwed}</p>
          </div>
        </div>
      </div>
      {!hasRepaidAuction && (
        <>
          <div className="px-6 py-1">
            <p className="leading-loose">
              Uh oh! {pastAuctionedString}
              tokenID #{auction.auctionAssetID} is being sold via liquidation
              auction! The proceeds will pay down debt and you will receive any
              excess.
            </p>
          </div>
          <Repay
            vault={vault}
            loanDetails={loanDetails}
            refresh={() => setHasRepaidAuction()}
            disabled={!vaultHasCollateral}
          />
        </>
      )}
      {hasRepaidAuction && (
        <div className="my-16">
          <img src="/u-came-back.png" />
        </div>
      )}
    </div>
  );
}
