import type { ethers } from "ethers";
import { useMemo } from "react";
import { usePaprController } from "~/hooks/usePaprController";
import { usePoolQuote } from "~/hooks/usePoolQuote";
import type { RiskLevel } from "~/lib/globalStore";
import { formatBigNum } from "~/lib/numberFormat";
import { NFTs } from "./NFTs";

type LoanDetailsAction = "borrow" | "repay" | "liquidating" | "liquidated";

type LoanDetailsBarProps = {
  collectionAddress: string;
  tokenIds: string[];
  riskLevel: RiskLevel;
  action: LoanDetailsAction;
  amountToBorrowOrRepay: ethers.BigNumber | null;
};

export function LoanDetails({
  collectionAddress,
  tokenIds,
  riskLevel,
  action,
  amountToBorrowOrRepay,
}: LoanDetailsBarProps) {
  const { underlying, paprToken } = usePaprController();

  const isLiquidationAction = useMemo(() => {
    return action === "liquidating" || action === "liquidated";
  }, [action]);
  const isBorrowing = useMemo(() => action === "borrow", [action]);
  const backgroundColor = useMemo(() => {
    if (isLiquidationAction) return "bg-liquidate-red";
    return `bg-${riskLevel}`;
  }, [isLiquidationAction, riskLevel]);

  const quote = usePoolQuote({
    amount: amountToBorrowOrRepay,
    inputToken: isBorrowing ? paprToken.id : underlying.id,
    outputToken: isBorrowing ? underlying.id : paprToken.id,
    tradeType: isBorrowing ? "exactIn" : "exactOut",
    skip: !amountToBorrowOrRepay || amountToBorrowOrRepay.isZero(),
  });

  const formattedAmount = useMemo(() => {
    if (!quote) return "...";
    return (
      formatBigNum(quote, underlying.decimals, 3) + ` ${underlying.symbol}`
    );
  }, [quote, underlying.decimals, underlying.symbol]);

  const leftText = useMemo(() => {
    if (isLiquidationAction) return "Rekt";
    return riskLevel;
  }, [isLiquidationAction, riskLevel]);

  const textColor = useMemo(() => {
    if (isLiquidationAction) return "text-white";
    return "text-black";
  }, [isLiquidationAction]);

  return (
    <div
      className={`w-full rounded-lg flex flex-row justify-between items-center ${backgroundColor} ${textColor} leading-8`}
    >
      <div className="flex flex-row items-center">
        <NFTs collectionAddress={collectionAddress} tokenIds={tokenIds} />
        <div className="ml-2">
          <p>{leftText}!</p>
        </div>
      </div>
      <RightText action={action} formattedAmount={formattedAmount} />
    </div>
  );
}

function RightText({
  action,
  formattedAmount,
}: {
  action: LoanDetailsAction;
  formattedAmount: string;
}) {
  if (action === "liquidating") {
    return (
      <div className="mr-2">
        <p>Liquidating!</p>
      </div>
    );
  }
  if (action === "liquidated") {
    return (
      <div className="mr-2">
        <p>Liquidated!</p>
      </div>
    );
  }

  return (
    <div className="mr-2">
      <p>
        {action === "borrow" ? "Borrow" : "Repay"} {formattedAmount}
        {action === "borrow" && "?"}
      </p>
    </div>
  );
}
