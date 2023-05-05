import { useMemo } from "react";
import { OraclePriceType } from "~/lib/reservoir";
import { riskLevelFromDebts } from "~/lib/utils";
import type { SubgraphVault } from "../useVault";
import { useMaxDebt } from "../useMaxDebt";
import { usePaprController } from "../usePaprController";

export function useRiskLevel(vault: NonNullable<SubgraphVault>) {
  const { paprToken } = usePaprController();
  const maxDebtForDefaultCollection = useMaxDebt(
    vault.token.id,
    OraclePriceType.lower
  );
  const maxDebtForVault = useMemo(() => {
    if (!maxDebtForDefaultCollection) return null;
    return maxDebtForDefaultCollection.mul(vault.collateral.length);
  }, [vault, maxDebtForDefaultCollection]);

  const riskLevel = useMemo(() => {
    if (!maxDebtForVault) return null;
    return riskLevelFromDebts(vault.debt, maxDebtForVault, paprToken.decimals);
  }, [vault.debt, maxDebtForVault, paprToken.decimals]);

  return riskLevel;
}
