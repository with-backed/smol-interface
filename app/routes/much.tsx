import { useCallback } from "react";
import { FrogCooker } from "~/components/FrogCooker";
import { RektScale } from "~/components/RektScale";
import { RiskRadio } from "~/components/RiskRadio";
import type { RiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";
import { riskLevelToLTV } from "~/lib/utils";

export default function HowMuchBorrow() {
  const maxDebt = useGlobalStore((s) => s.inProgressLoan?.maxDebtForChosen);
  const setInProgressLoan = useGlobalStore((s) => s.setInProgressLoan);
  const riskLevel = useGlobalStore((s) => s.inProgressLoan?.riskLevel);

  const setSelectedBorrow = useCallback(
    (riskLevel: RiskLevel) => {
      if (!maxDebt) return;
      const multiplier = riskLevelToLTV[riskLevel].start;
      setInProgressLoan((prev) => {
        if (prev) {
          return {
            ...prev,
            amount: maxDebt.mul(multiplier).div(100),
            riskLevel,
          };
        }
        return null;
      });
    },
    [maxDebt, setInProgressLoan]
  );

  return (
    <div className="flex h-full">
      <RektScale />
      <div className="flex flex-col items-center w-full grow-0 mt-12">
        <RiskRadio riskLevel={riskLevel} handleChange={setSelectedBorrow} />
        <FrogCooker />
      </div>
    </div>
  );
}
