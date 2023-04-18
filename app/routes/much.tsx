import { useCallback } from "react";
import { Button } from "~/components/Buttons/Button";
import type { RiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";

export default function HowMuchBorrow() {
  const maxDebt = useGlobalStore((s) => s.selectedLoan.maxDebtForChosen);
  const setSelectedLoan = useGlobalStore((s) => s.setSelectedLoan);

  const setSelectedBorrow = useCallback(
    (multiplier: number, riskLevel: RiskLevel) => {
      if (!maxDebt) return;
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
        <Button theme="bg-fine" onClick={() => setSelectedBorrow(50, "fine")}>
          Fine
        </Button>
        <Button theme="bg-risky" onClick={() => setSelectedBorrow(70, "risky")}>
          Risky
        </Button>
        <Button theme="bg-rekt" onClick={() => setSelectedBorrow(90, "rekt")}>
          Rekt
        </Button>
      </div>
    </div>
  );
}
