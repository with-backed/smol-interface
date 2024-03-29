import { useMemo } from "react";
import { OraclePriceType } from "~/lib/reservoir";
import { riskLevelFromDebts } from "~/lib/utils";
import { useMaxDebt } from "../useMaxDebt";
import { usePaprController } from "../usePaprController";
import type { ethers } from "ethers";

type LoanSpec = {
  collateralAddress: string;
  collateralCount: number;
  debt: ethers.BigNumber;
};

export function useRiskLevel({
  collateralAddress,
  collateralCount,
  debt,
}: LoanSpec) {
  const { paprToken } = usePaprController();
  const maxDebtForDefaultCollection = useMaxDebt(
    collateralAddress,
    OraclePriceType.twap
  );
  const maxDebtForVault = useMemo(() => {
    if (!maxDebtForDefaultCollection) return null;
    return maxDebtForDefaultCollection.mul(collateralCount);
  }, [collateralCount, maxDebtForDefaultCollection]);

  const riskLevel = useMemo(() => {
    if (!maxDebtForVault) return null;
    return riskLevelFromDebts(debt, maxDebtForVault, paprToken.decimals);
  }, [debt, maxDebtForVault, paprToken.decimals]);

  return riskLevel;
}
