import { useCallback } from "react";
import { Button } from "~/components/Buttons/Button";
import type { RiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";
import { riskLevelToLTV } from "~/lib/utils";

export default function HowMuchBorrow() {
  const maxDebt = useGlobalStore((s) => s.selectedLoan.maxDebtForChosen);
  const setSelectedLoan = useGlobalStore((s) => s.setSelectedLoan);

  const setSelectedBorrow = useCallback(
    (riskLevel: RiskLevel) => {
      if (!maxDebt) return;
      const multiplier = riskLevelToLTV[riskLevel].start;
      setSelectedLoan((prev) => ({
        ...prev,
        amountBorrow: maxDebt.mul(multiplier).div(100),
        riskLevel,
      }));
    },
    [maxDebt, setSelectedLoan]
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
