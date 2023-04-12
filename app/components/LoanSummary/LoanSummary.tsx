import { useMemo } from "react";
import { useLoan } from "~/hooks/useLoan";
import { usePaprController } from "~/hooks/usePaprController";
import { formatBigNum, formatPercent } from "~/lib/numberFormat";

type LoanSummaryProps = {
  collateralAddress: string;
};

export function LoanSummary({ collateralAddress }: LoanSummaryProps) {
  const { id, underlying } = usePaprController();
  const { borrowed, totalRepayment, interest, numDays, costPercentage } =
    useLoan(id, collateralAddress);

  const formattedBorrow = useMemo(() => {
    if (!borrowed) return "...";
    return formatBigNum(borrowed, underlying.decimals) + " ETH";
  }, [borrowed, underlying.decimals]);

  const formattedInterest = useMemo(() => {
    if (!interest) return "...";
    return formatBigNum(interest, underlying.decimals) + " ETH";
  }, [interest, underlying.decimals]);

  const formattedRepayment = useMemo(() => {
    if (!totalRepayment) return "...";
    return formatBigNum(totalRepayment, underlying.decimals) + " ETH";
  }, [totalRepayment, underlying.decimals]);

  const formattedCostPercentage = useMemo(() => {
    if (!costPercentage) return "...";
    return formatPercent(costPercentage);
  }, [costPercentage]);

  return (
    <div className="w-full flex flex-col">
      <div className="flex-initial flex flex-col p-6">
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Borrowed:</p>
          </div>
          <div>
            <p>{formattedBorrow}</p>
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
            <p>{formattedRepayment}</p>
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
          Repay {formattedRepayment}
        </button>
      </div>
    </div>
  );
}
