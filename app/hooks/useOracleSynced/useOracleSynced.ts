import { useOracleInfo } from "~/hooks/useOracleInfo";
import { useTimestamp } from "~/hooks/useTimestamp";
import { useEffect, useState } from "react";
import type { OraclePriceType } from "~/lib/reservoir";

export function useOracleSynced(
  collateralContractAddress: string,
  oracleKind: OraclePriceType
) {
  const oracleInfo = useOracleInfo(oracleKind);

  const [synced, setSynced] = useState<boolean>(false);
  const blockTimestamp = useTimestamp();

  useEffect(() => {
    if (!blockTimestamp || !oracleInfo) return;
    if (
      blockTimestamp.timestamp >=
      oracleInfo[collateralContractAddress].message.timestamp
    ) {
      setSynced(true);
    }
  }, [blockTimestamp, oracleInfo, collateralContractAddress]);

  return synced;
}
