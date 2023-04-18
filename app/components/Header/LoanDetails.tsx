import { useAsset } from "@center-inc/react";
import type { ethers } from "ethers";
import { useMemo } from "react";
import { usePaprController } from "~/hooks/usePaprController";
import { usePoolQuote } from "~/hooks/usePoolQuote";
import type { RiskLevel } from "~/lib/globalStore";
import { formatBigNum } from "~/lib/numberFormat";

type LoanDetailsBarProps = {
  collectionAddress: string;
  tokenIds: string[];
  riskLevel: RiskLevel;
  type: "borrow" | "repay";
  amountToBorrowOrRepay: ethers.BigNumber | null;
};

export function LoanDetails({
  collectionAddress,
  tokenIds,
  riskLevel,
  type,
  amountToBorrowOrRepay,
}: LoanDetailsBarProps) {
  const { underlying, paprToken } = usePaprController();

  const isBorrowing = useMemo(() => type === "borrow", [type]);

  const quote = usePoolQuote({
    amount: amountToBorrowOrRepay,
    inputToken: isBorrowing ? paprToken.id : underlying.id,
    outputToken: isBorrowing ? underlying.id : paprToken.id,
    tradeType: isBorrowing ? "exactIn" : "exactOut",
    skip: !amountToBorrowOrRepay,
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
      className={`w-full rounded-lg flex flex-row justify-between items-center bg-${riskLevel} text-black`}
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
      <div className="mr-2">
        <p>
          {type === "borrow" ? "Borrow" : "Repay"} {formattedAmount}
          {type === "borrow" && "?"}
        </p>
      </div>
    </div>
  );
}
