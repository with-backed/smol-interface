import { useAsset } from "@center-inc/react";
import { ethers } from "ethers";
import { useMemo } from "react";
import { erc20ABI, useAccount, useContractRead } from "wagmi";
import { usePaprController } from "~/hooks/usePaprController";
import { usePoolQuote } from "~/hooks/usePoolQuote";
import type { RiskLevel } from "~/lib/globalStore";
import { formatBigNum } from "~/lib/numberFormat";

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

  const liquidationAction = useMemo(() => {
    return action === "liquidating" || action === "liquidated";
  }, [action]);
  const isBorrowing = useMemo(() => action === "borrow", [action]);
  const backgroundColor = useMemo(() => {
    if (liquidationAction) return "bg-liquidate-red";
    return `bg-${riskLevel}`;
  }, [liquidationAction, riskLevel]);

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

  const assets = useAsset({
    address: collectionAddress,
    tokenId: tokenIds[0],
  });
  const assetUrl = useMemo(() => {
    return assets[0].mediaUrl;
  }, [assets]);

  return (
    <div
      className={`w-full rounded-lg flex flex-row justify-between items-center ${backgroundColor} text-black leading-8`}
    >
      <div className="flex flex-row items-center">
        <div className="w-7 h-7">
          <div className="w-full h-full">
            {!assetUrl && <span>...</span>}
            {assetUrl && (
              <img src={assetUrl} alt="nft" className="rounded-lg" />
            )}
          </div>
        </div>
        <div className="ml-2">
          <p>{riskLevel}!</p>
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
