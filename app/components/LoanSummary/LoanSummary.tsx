import { useMemo } from "react";
import { useLoan } from "~/hooks/useLoan";
import { usePaprController } from "~/hooks/usePaprController";
import { formatBigNum, formatPercent } from "~/lib/numberFormat";

type LoanSummaryProps = {
  collateralAddress: string;
};

export function LoanSummary({ collateralAddress }: LoanSummaryProps) {
  const { id } = usePaprController();
  const {
    formattedBorrowed,
    formattedTotalRepayment,
    formattedInterest,
    formattedCostPercentage,
    numDays,
  } = useLoan(id, collateralAddress);

  return (
    <div className="w-full flex flex-col">
      <div className="flex-initial flex flex-col p-6">
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Borrowed:</p>
          </div>
          <div>
            <p>{formattedBorrowed}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Cost:</p>
          </div>
          <div>
            <p>{formattedInterest}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Total Repayment:</p>
          </div>
          <div>
            <p>{formattedTotalRepayment}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>({numDays} day) cost as %: </p>
          </div>
          <div>
            <p>{formattedCostPercentage}</p>
          </div>
        </div>
      </div>
      <div className="my-4">
        <img src="/instrument.png" />
      </div>
      <div className="graphPapr flex-auto flex flex-col justify-center items-center">
        {/* TODO(adamgobes): use tx button with write */}
        <button className="bg-adventureYellow p-2 rounded-lg w-48">
          Repay {formattedTotalRepayment}
        </button>
      </div>
    </div>
  );
}
