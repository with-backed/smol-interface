import type { ethers } from "ethers";
import { useMemo } from "react";
import { usePaprController } from "~/hooks/usePaprController";
import { usePoolQuote } from "~/hooks/usePoolQuote";
import type { RiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";
import { formatBigNum } from "~/lib/numberFormat";
import { NFTs } from "./NFTs";
import { Button } from "reakit/ts";

type LoanDetailsAction =
  | "borrow"
  | "repay"
  | "liquidating"
  | "liquidated"
  | "claim";

type LoanDetailsBarProps = {
  collectionAddress: string;
  tokenIds: string[];
  riskLevel: RiskLevel;
  action: LoanDetailsAction;
  amount: ethers.BigNumber | null;
  handleClick?: () => void;
};

export function LoanDetails({
  collectionAddress,
  tokenIds,
  riskLevel,
  action,
  amount,
  handleClick = undefined,
}: LoanDetailsBarProps) {
  const { underlying, paprToken } = usePaprController();
  const hasRepaid = useGlobalStore(
    (s) => s.recentActions[collectionAddress]?.hasRepaid || false
  );
  const hasClaimed = useGlobalStore(
    (s) => s.recentActions[collectionAddress]?.hasClaimed || false
  );

  const isLiquidationAction = useMemo(() => {
    return (
      action === "liquidating" || action === "liquidated" || action === "claim"
    );
  }, [action]);
  const isBorrowing = useMemo(() => action === "borrow", [action]);

  const backgroundColor = useMemo(() => {
    if (hasRepaid || hasClaimed) return "bg-medium-grey";
    if (isLiquidationAction) return "bg-liquidate-red";
    return `bg-${riskLevel}`;
  }, [hasRepaid, hasClaimed, isLiquidationAction, riskLevel]);

  const quote = usePoolQuote({
    amount,
    inputToken: isBorrowing ? paprToken.id : underlying.id,
    outputToken: isBorrowing ? underlying.id : paprToken.id,
    tradeType: isBorrowing ? "exactIn" : "exactOut",
    skip: !amount || amount.isZero(),
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
    if (isLiquidationAction && !hasRepaid && !hasClaimed) return "text-white";
    return "text-black";
  }, [isLiquidationAction, hasRepaid, hasClaimed]);

  const pointerClassName = useMemo(() => {
    return handleClick ? "cursor-pointer" : "";
  }, [handleClick]);

  return (
    <Button
      as="div"
      className={`w-full rounded-lg flex flex-row justify-between items-center ${backgroundColor} ${textColor} ${pointerClassName} leading-8`}
      onClick={handleClick}
    >
      <div className="flex flex-row items-center">
        <NFTs collectionAddress={collectionAddress} tokenIds={tokenIds} />
        <div className="ml-2">
          <p>{leftText}!</p>
        </div>
      </div>
      <RightText
        action={action}
        formattedAmount={formattedAmount}
        hasRepaid={hasRepaid}
        hasClaimed={hasClaimed}
      />
    </Button>
  );
}

function RightText({
  action,
  formattedAmount,
  hasRepaid,
  hasClaimed,
}: {
  action: LoanDetailsAction;
  formattedAmount: string;
  hasRepaid: boolean;
  hasClaimed: boolean;
}) {
  if (hasRepaid) {
    return (
      <div className="mr-2">
        <p>Repaid</p>
      </div>
    );
  }

  if (hasClaimed) {
    return (
      <div className="mr-2">
        <p>Claimed</p>
      </div>
    );
  }

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
        <p>Repaid!</p>
      </div>
    );
  }

  if (action === "claim") {
    return (
      <div className="mr-2">
        <p>Claim Excess!</p>
      </div>
    );
  }

  return (
    <div className="mr-2">
      <p>
        {action === "borrow" ? "Borrow" : "Repay"} {formattedAmount}
      </p>
    </div>
  );
}
