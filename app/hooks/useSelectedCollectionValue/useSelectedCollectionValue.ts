import { useGlobalStore } from "~/lib/globalStore";
import { useCollectionTwapBidChange } from "../useCollectionTwapBidChange";

export function useSelectedCollectionValue() {
  const { collateralCount, collection } = useGlobalStore((s) => ({
    collection:
      s.selectedVault?.token.id || s.inProgressLoan?.collectionAddress,
    collateralCount:
      s.selectedVault?.collateral.length || s.inProgressLoan?.tokenIds.length,
  }));

  const result = useCollectionTwapBidChange(collection || "");

  return { ...result, collateralCount };
}
