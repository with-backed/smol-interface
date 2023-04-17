import { useLoan } from "~/hooks/useLoan";
import type { SubgraphVault } from "~/hooks/useVault";
import { LoanDetails } from "./LoanDetails";

export function LoanSummaryRepaid({
  vault,
}: {
  vault: NonNullable<SubgraphVault>;
}) {
  const {
    formattedBorrowed,
    formattedTotalRepayment,
    formattedInterest,
    formattedCostPercentage,
    numDays,
  } = useLoan(vault);

  return (
    <>
      <LoanDetails
        borrowed={formattedBorrowed}
        interest={formattedInterest}
        totalRepayment={formattedTotalRepayment}
        numDays={numDays}
        costPercentage={formattedCostPercentage}
      />
      <div className="my-4 flex-auto flex flex-col">
        <img src="/u-came-back.png" />
      </div>
    </>
  );
}
