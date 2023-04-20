import { useCallback } from "react";
import { Button } from "~/components/Buttons/Button";
import type { RiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";
import { riskLevelToLTV } from "~/lib/utils";

export default function HowMuchBorrow() {
  const maxDebt = useGlobalStore((s) => s.inProgressLoan?.maxDebtForChosen);
  const setInProgressLoan = useGlobalStore((s) => s.setInProgressLoan);

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
    <div className="flex flex-col">
      <div className="flex flex-row">
        <Button theme="bg-fine" onClick={() => setSelectedBorrow("fine")}>
          Fine
        </Button>
        <Button theme="bg-risky" onClick={() => setSelectedBorrow("risky")}>
          Risky
        </Button>
        <Button theme="bg-rekt" onClick={() => setSelectedBorrow("rekt")}>
          Rekt
        </Button>
      </div>
    </div>
  );
}
