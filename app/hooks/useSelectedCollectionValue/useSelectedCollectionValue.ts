import { useGlobalStore } from "~/lib/globalStore";
import { useCollectionTwapBidChange } from "../useCollectionTwapBidChange";

export function useSelectedCollectionValue() {
  const { collateralCount, collection } = useGlobalStore((s) => ({
    collection:
      // it's really weird that this is the way we recover the collection address
      s.selectedVault?.collateral[0].id.split("-")[0] ||
      s.inProgressLoan?.collectionAddress,
    collateralCount:
      s.selectedVault?.collateral.length || s.inProgressLoan?.tokenIds.length,
  }));

  const result = useCollectionTwapBidChange(collection || "");

  return { ...result, collateralCount };
}
