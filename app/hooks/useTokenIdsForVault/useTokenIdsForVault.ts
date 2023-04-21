import { useMemo } from "react";
import type { SubgraphVault } from "../useVault";

export function useTokenIdsForVault(vault: SubgraphVault) {
  const tokenIds = useMemo(() => {
    if (!vault) return [];
    const vaultTokenIds = vault.collateral.map((c) => c.tokenId);
    const ongoingAuctionTokenIds = vault.ongoingAuctions.map(
      (a) => a.auctionAssetID
    );
    const pastAuctionTokenIds = vault.pastAuctions.map((a) => a.auctionAssetID);
    return vaultTokenIds
      .concat(ongoingAuctionTokenIds)
      .concat(pastAuctionTokenIds);
  }, [vault]);

  return tokenIds;
}
