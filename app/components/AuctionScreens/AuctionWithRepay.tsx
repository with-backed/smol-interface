import { useCallback, useMemo } from "react";
import { useGlobalStore } from "~/lib/globalStore";
import { useLoan } from "~/hooks/useLoan";
import { Repay } from "../Repay";
import type { VaultWithRiskLevel } from "~/lib/globalStore";
import { Link } from "@remix-run/react";
import { useConfig } from "~/hooks/useConfig";

type AuctionWithRepayProps = {
  vault: NonNullable<VaultWithRiskLevel>;
};

export function AuctionWithRepay({ vault }: AuctionWithRepayProps) {
  const { tokenName } = useConfig();
  const loanDetails = useLoan(vault);

  const currentOngoingAuction = useMemo(() => {
    return vault.ongoingAuctions[0]; // assume only one ongoing auction, will rarely ever have two in a rational market
  }, [vault.ongoingAuctions]);
  const currentAuctionRender = useMemo(() => {
    if (!currentOngoingAuction) return "";
    return (
      <span>
        tokenID #${currentOngoingAuction.auctionAssetID} is being sold via{" "}
        <Link
          className="text-link-text"
          to={`https://papr.wtf/tokens/${tokenName}/auctions/${currentOngoingAuction.id}`}
        >
          liquidation auction!
        </Link>{" "}
        The proceeds will pay down debt and you will receive any excess.
      </span>
    );
  }, [currentOngoingAuction, tokenName]);

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
              Uh oh! {pastAuctionedString} {currentAuctionRender}
            </p>
          </div>
          <Repay
            vault={vault}
            loanDetails={loanDetails}
            buttonText={`Repay ${loanDetails.formattedTotalOwed}`}
            refresh={() => setHasRepaidAuction()}
            disabled={vault.collateral.length === 0}
          />
        </>
      )}
      {hasRepaidAuction && (
        <div className="my-16">
          <img src="/5-happy-super-dance.svg" />
        </div>
      )}
    </div>
  );
}
