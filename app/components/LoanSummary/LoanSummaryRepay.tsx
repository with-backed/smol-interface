import { useLoan } from "~/hooks/useLoan";
import type { SubgraphVault } from "~/hooks/useVault";
import { LoanDetails } from "./LoanDetails";
import { useGlobalStore } from "~/lib/globalStore";
import { Repay } from "../Repay";
import { useMemo } from "react";
import { Link } from "@remix-run/react";

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
      {loanDetails.usedPaprWtf && (
        <div className="p-6 text-sm leading-7 flex flex-col">
          <p>
            This loan was created or edited on{" "}
            <Link
              to="https://papr.wtf"
              className="text-link-text"
              target="_blank"
            >
              papr.wtf
            </Link>
            . View detailed history and manage loan there.
          </p>
        </div>
      )}

      {!loanDetails.usedPaprWtf && (
        <LoanDetails
          borrowed={loanDetails.formattedBorrowed}
          interest={loanDetails.formattedInterest}
          totalRepayment={owedOrRepaid}
          numDays={loanDetails.numDays}
          costPercentage={loanDetails.formattedCostPercentage}
        />
      )}

      <div className="mt-auto">
        {vaultHasDebt && (
          <img
            className="mb-[-25px] px-8"
            src="/5-instrument-super-dance.svg"
            alt=""
          />
        )}
        {!vaultHasDebt && (
          <img
            className="mb-[-25px] px-8"
            src="/5-happy-super-dance.svg"
            alt=""
          />
        )}

        <Repay
          vault={{ ...vault, riskLevel }}
          loanDetails={loanDetails}
          buttonText={repayButtonText}
          refresh={refresh}
        />
      </div>
    </>
  );
}
