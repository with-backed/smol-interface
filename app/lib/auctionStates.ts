import { ethers } from "ethers";
import { SubgraphVault } from "~/hooks/useVault";

export function isCurrentAuctionWithRepay(vault: NonNullable<SubgraphVault>) {
  return (
    vault.ongoingAuctions.length > 0 &&
    !ethers.BigNumber.from(vault.debt).isZero()
  );
}

export function isPastAuctionWithRepay(vault: NonNullable<SubgraphVault>) {
  if (vault.pastAuctions.length === 0) return false;

  const latestAuctionEndTime = vault.pastAuctions.sort(
    (a, b) => b.end!.timestamp - a.end!.timestamp
  )[0].end!.timestamp;

  const latestBorrowBeforeAuction =
    vault.latestIncreaseDebt < latestAuctionEndTime;

  return (
    latestBorrowBeforeAuction && !ethers.BigNumber.from(vault.debt).isZero()
  );
}

export function isPastAuctionWithClaim(
  vault: NonNullable<SubgraphVault>,
  paprBalance: ethers.BigNumber
) {
  return (
    vault.pastAuctions.length > 0 &&
    ethers.BigNumber.from(vault.debt).isZero() &&
    paprBalance.gt(0)
  );
}
