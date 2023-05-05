import { useGlobalStore } from "~/lib/globalStore";
import { usePaprController } from "../usePaprController";
import { useTarget } from "../useTarget";
import { useMemo } from "react";
import { ethers } from "ethers";
import { formatTokenAmount } from "~/lib/numberFormat";

export function useLiquidationTriggerPrice() {
  const {
    maxLTV,
    paprToken: { decimals },
    underlying: { symbol: underlyingSymbol },
  } = usePaprController();
  const newTargetResult = useTarget();
  const debt = useGlobalStore(
    (s) => s.selectedVault?.debt || s.inProgressLoan?.amount
  );
  const chosenDebt = useMemo(() => {
    if (!debt) {
      return null;
    }
    const debtBigNum = ethers.BigNumber.from(debt);
    return parseFloat(ethers.utils.formatUnits(debtBigNum, decimals));
  }, [debt, decimals]);
  const newTargetNumber = useMemo(
    () =>
      newTargetResult
        ? parseFloat(ethers.utils.formatUnits(newTargetResult.target, decimals))
        : null,
    [decimals, newTargetResult]
  );
  const liquidationTriggerPrice = useMemo(() => {
    if (!chosenDebt) {
      return null;
    }
    if (!newTargetNumber) {
      return "...";
    }
    const maxLTVNumber = convertOneScaledValue(
      ethers.BigNumber.from(maxLTV),
      2
    );

    const amount = (chosenDebt * newTargetNumber) / maxLTVNumber;
    return `${formatTokenAmount(amount)} ${underlyingSymbol}`;
  }, [chosenDebt, maxLTV, newTargetNumber, underlyingSymbol]);

  return liquidationTriggerPrice;
}

const ONE = ethers.BigNumber.from(10).pow(18);
function convertOneScaledValue(n: ethers.BigNumber, decimals: number): number {
  return n.div(ONE.div(10 ** decimals)).toNumber() / 10 ** decimals;
}
