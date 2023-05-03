import { ethers } from "ethers";
import type { SubgraphVault } from "~/hooks/useVault";

export function isAuctionWithRepay(vault: NonNullable<SubgraphVault>) {
  let latestBorrowBeforeLatestAuction = false;
  if (vault.pastAuctions.length > 0) {
    const latestAuctionEndTime = vault.pastAuctions.sort(
      (a, b) => b.end!.timestamp - a.end!.timestamp
    )[0].end!.timestamp;

    latestBorrowBeforeLatestAuction =
      vault.latestIncreaseDebt < latestAuctionEndTime;
  }

  return (
    (vault.ongoingAuctions.length > 0 || latestBorrowBeforeLatestAuction) &&
    !ethers.BigNumber.from(vault.debt).isZero()
  );
}

export function isAuctionWithClaim(
  vault: NonNullable<SubgraphVault>,
  paprBalance: ethers.BigNumber
) {
  return (
    vault.pastAuctions.length > 0 &&
    ethers.BigNumber.from(vault.debt).isZero() &&
    paprBalance.gt(0)
  );
}
