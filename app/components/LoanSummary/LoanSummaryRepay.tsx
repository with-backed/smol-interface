import { useLoan } from "~/hooks/useLoan";
import type { SubgraphVault } from "~/hooks/useVault";
import { LoanDetails } from "./LoanDetails";
import { useGlobalStore } from "~/lib/globalStore";
import { Repay } from "../Repay";
import { useMemo } from "react";

type LoanSummaryRepayProps = {
  vault: NonNullable<SubgraphVault>;
  refresh: () => void;
};

export function LoanSummaryRepay({ vault, refresh }: LoanSummaryRepayProps) {
  const riskLevel = useGlobalStore((s) => s.selectedVault!.riskLevel);

  const loanDetails = useLoan(vault);

  const vaultHasDebt = useMemo(() => {
    return !loanDetails.vaultDebt.isZero();
  }, [loanDetails.vaultDebt]);
  const owedOrRepaid = useMemo(() => {
    if (vaultHasDebt) {
      return loanDetails.formattedTotalOwed;
    }

    return loanDetails.formattedRepaid;
  }, [vaultHasDebt, loanDetails]);

  const repayButtonText = useMemo(() => {
    if (vaultHasDebt) {
      return `Repay ${loanDetails.formattedTotalOwed}`;
    }
    return `Repaid ${loanDetails.formattedRepaid}`;
  }, [loanDetails, vaultHasDebt]);

  return (
    <>
      <LoanDetails
        borrowed={loanDetails.formattedBorrowed}
        interest={loanDetails.formattedInterest}
        totalRepayment={owedOrRepaid}
        numDays={loanDetails.numDays}
        costPercentage={loanDetails.formattedCostPercentage}
      />
      <div className="my-4">
        {vaultHasDebt && <img src="/5-instrument-super-dance.svg" />}
        {!vaultHasDebt && <img src="/5-happy-super-dance.svg" />}
      </div>
      <Repay
        vault={{ ...vault, riskLevel }}
        loanDetails={loanDetails}
        buttonText={repayButtonText}
        refresh={refresh}
      />
    </>
  );
}
