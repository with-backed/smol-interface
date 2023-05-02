import { useLoan } from "~/hooks/useLoan";
import type { SubgraphVault } from "~/hooks/useVault";
import { LoanDetails } from "./LoanDetails";
import { Button } from "../Buttons/Button";

export function LoanSummaryRepaid({
  vault,
}: {
  vault: NonNullable<SubgraphVault>;
}) {
  const {
    formattedBorrowed,
    formattedRepaid,
    formattedInterest,
    formattedCostPercentage,
    numDays,
  } = useLoan(vault);

  return (
    <>
      <LoanDetails
        borrowed={formattedBorrowed}
        interest={formattedInterest}
        totalRepayment={formattedRepaid}
        numDays={numDays}
        costPercentage={formattedCostPercentage}
      />
      <div>
        <img src="/u-came-back.png" />
      </div>
      <div className="graphPapr flex-auto flex flex-col justify-center items-center">
        <Button theme="bg-completed-grey" additionalClassNames={["text-white"]}>
          Repaid {formattedRepaid}
        </Button>
      </div>
    </>
  );
}
