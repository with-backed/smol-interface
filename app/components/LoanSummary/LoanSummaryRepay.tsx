import { useLoan } from "~/hooks/useLoan";
import type { SubgraphVault } from "~/hooks/useVault";
import { LoanDetails } from "./LoanDetails";
import { useGlobalStore } from "~/lib/globalStore";
import { Repay } from "../Repay";

type LoanSummaryRepayProps = {
  vault: NonNullable<SubgraphVault>;
  refresh: () => void;
};

export function LoanSummaryRepay({ vault, refresh }: LoanSummaryRepayProps) {
  const riskLevel = useGlobalStore((s) => s.selectedVault!.riskLevel); // really should just pass down the selected vault here, will do in a future PR

  const loanDetails = useLoan(vault);

  return (
    <>
      <LoanDetails
        borrowed={loanDetails.formattedBorrowed}
        interest={loanDetails.formattedInterest}
        totalRepayment={loanDetails.formattedTotalRepayment}
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
