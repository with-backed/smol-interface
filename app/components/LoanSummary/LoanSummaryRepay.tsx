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
  const riskLevel = useGlobalStore((s) => s.selectedVault!.riskLevel); // really should just pass down the selected vault here, will do in a future PR

  const loanDetails = useLoan(vault);

  const owedOrRepaid = useMemo(() => {
    if (loanDetails.vaultDebt.isZero()) {
      return loanDetails.formattedRepaid;
    }

    return loanDetails.formattedTotalOwed;
  }, [loanDetails]);

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
        <img src="/instrument.png" />
      </div>
      <Repay
        vault={{ ...vault, riskLevel }}
        loanDetails={loanDetails}
        refresh={refresh}
      />
    </>
  );
}
