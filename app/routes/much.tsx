import { useCallback, useState } from "react";
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
  const [loggedOutRiskLevel, setLoggedOutRiskLevel] = useState<
    RiskLevel | undefined
  >(undefined);

  const setSelectedBorrow = useCallback(
    (riskLevel: RiskLevel) => {
      // If the user is logged out, we need to store the risk level so we can
      // respond to changes to simulate the logged in experience.
      // We want to keep this state local rather than global because nothing
      // other than this screen should care about it.
      setLoggedOutRiskLevel(riskLevel);
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
      <div className="flex flex-col items-center w-full grow-0 mt-12'">
        <RiskRadio riskLevel={riskLevel} handleChange={setSelectedBorrow} />
        <FrogCooker riskLevel={riskLevel || loggedOutRiskLevel} />
      </div>
    </div>
  );
}
