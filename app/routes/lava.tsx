import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { FrogCooker } from "~/components/FrogCooker";
import { RektScale } from "~/components/RektScale";
import { RiskRadio } from "~/components/RiskRadio";
import type { RiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";
import { riskLevelToLTV } from "~/lib/utils";

export default function Lava() {
  const { isConnected } = useAccount();
  const maxDebt = useGlobalStore((s) => s.inProgressLoan?.maxDebtForChosenPapr);
  const selectedVaultExists = useGlobalStore((s) => !!s.selectedVault);
  const inProgressLoanExists = useGlobalStore((s) => !!s.inProgressLoan);
  const setInProgressLoan = useGlobalStore((s) => s.setInProgressLoan);
  const storeRiskLevel = useGlobalStore((s) =>
    s.inProgressLoan ? s.inProgressLoan.riskLevel : s.selectedVault?.riskLevel
  );
  const [loggedOutRiskLevel, setLoggedOutRiskLevel] =
    useState<RiskLevel>("fine");

  const setSelectedBorrow = useCallback(
    (riskLevel: RiskLevel) => {
      // If the user is logged out, we need to store the risk level so we can
      // respond to changes to simulate the logged in experience.
      // We want to keep this state local rather than global because nothing
      // other than this screen should care about it.
      setLoggedOutRiskLevel(riskLevel);
      if (!maxDebt) return;
      const multiplier = riskLevelToLTV[riskLevel].default;
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

  useEffect(() => {
    // checking if max debt exists is a shortcut to determine if they have an in progress loan
    // if they do, default to the logged out risk level
    if (maxDebt) {
      setSelectedBorrow(loggedOutRiskLevel);
    }
  }, [loggedOutRiskLevel, setSelectedBorrow, maxDebt]);

  const showRiskRadioButtons = useMemo(() => {
    return !isConnected || !selectedVaultExists || inProgressLoanExists;
  }, [isConnected, selectedVaultExists, inProgressLoanExists]);

  return (
    <>
      <div className="flex h-full">
        <RektScale riskLevel={storeRiskLevel || loggedOutRiskLevel} />
        <div className="flex flex-col items-center w-full grow-0 pt-6 h-2/4">
          <FrogCooker riskLevel={storeRiskLevel || loggedOutRiskLevel} />
        </div>
      </div>
      {showRiskRadioButtons && (
        <div className="flex flex-col py-2 items-center">
          <span>How much to borrow?</span>
          <RiskRadio
            riskLevel={storeRiskLevel || loggedOutRiskLevel}
            handleChange={setSelectedBorrow}
          />
        </div>
      )}
    </>
  );
}
