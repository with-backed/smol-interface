import { useMemo } from "react";
import { useOracleInfo } from "~/hooks/useOracleInfo";
import { useGlobalStore } from "~/lib/globalStore";
import { OraclePriceType } from "~/lib/reservoir";

export function useSelectedCollectionValue() {
  const oracleInfo = useOracleInfo(OraclePriceType.twap);

  const { collateralCount, collection } = useGlobalStore((s) => ({
    collection:
      // it's really weird that this is the way we recover the collection address
      s.selectedVault?.collateral[0].id.split("-")[0] ||
      s.inProgressLoan?.collectionAddress,
    collateralCount:
      s.selectedVault?.collateral.length || s.inProgressLoan?.tokenIds.length,
  }));

  const collateralValue = useMemo(() => {
    if (!oracleInfo || !collection || !collateralCount) {
      return null;
    }

    return oracleInfo[collection].price * collateralCount;
  }, [collateralCount, collection, oracleInfo]);

  return collateralValue;
}
