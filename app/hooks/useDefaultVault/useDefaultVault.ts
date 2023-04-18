import { useEffect, useMemo } from "react";
import type { SubgraphVault } from "../useVault";
import { useGlobalStore } from "~/lib/globalStore";
import { useMaxDebt } from "../useMaxDebt";
import { OraclePriceType } from "~/lib/reservoir";
import { HeaderState } from "~/components/Header";
import { usePaprController } from "../usePaprController";
import { getAddress } from "ethers/lib/utils.js";
import { riskLevelFromDebts } from "~/lib/utils";

export function useDefaultVault(currentVaults: SubgraphVault[] | null) {
  const { paprToken } = usePaprController();
  const state = useGlobalStore((s) => s.state);
  const setSelectedLoan = useGlobalStore((s) => s.setSelectedLoan);

  const defaultVault = useMemo(() => {
    if (!currentVaults) return null;
    return currentVaults[0];
  }, [currentVaults]);
  const maxDebtForDefaultCollection = useMaxDebt(
    defaultVault ? [defaultVault.token.id] : [],
    OraclePriceType.lower
  );
  const maxDebtForVault = useMemo(() => {
    if (!maxDebtForDefaultCollection || !defaultVault) return null;
    return maxDebtForDefaultCollection.mul(defaultVault.collateral.length);
  }, [defaultVault, maxDebtForDefaultCollection]);

  useEffect(() => {
    if (defaultVault && maxDebtForVault && state === HeaderState.Default) {
      setSelectedLoan((_prev) => ({
        collectionAddress: getAddress(defaultVault.token.id),
        tokenIds: defaultVault.collateral.map((c) => c.tokenId),
        amountRepay: defaultVault.debt,
        amountBorrow: null,
        riskLevel: riskLevelFromDebts(
          defaultVault.debt,
          maxDebtForVault,
          paprToken.decimals
        ),
        maxDebtForCollection: maxDebtForVault,
        maxDebtForChosen: null,
        isExistingLoan: true,
      }));
    }
  }, [
    state,
    defaultVault,
    maxDebtForVault,
    setSelectedLoan,
    paprToken.decimals,
  ]);
}
