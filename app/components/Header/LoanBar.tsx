import { useAsset } from "@center-inc/react";
import type { ethers } from "ethers";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { usePaprController } from "~/hooks/usePaprController";
import { usePoolQuote } from "~/hooks/usePoolQuote";
import type { RiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";
import { formatBigNum } from "~/lib/numberFormat";

export function LoanBar() {
  const { paprToken, underlying } = usePaprController();
  const { isConnected } = useAccount();
  const className = useMemo(() => {
    const justification = isConnected ? "justify-between" : "justify-center";
    return `flex items-center bg-black text-white relative px-4 min-h-[50px] ${justification}`;
  }, [isConnected]);

  const selectedLoan = useGlobalStore((s) => s.selectedLoan);

  const hasSelectedNFTs = useMemo(() => {
    return !!selectedLoan.collectionAddress && selectedLoan.tokenIds.length > 0;
  }, [selectedLoan.collectionAddress, selectedLoan.tokenIds.length]);

  const amountBorrowInEth = usePoolQuote({
    amount: selectedLoan.amountBorrow,
    inputToken: paprToken.id,
    outputToken: underlying.id,
    tradeType: "exactIn",
    skip: !selectedLoan.amountBorrow,
  });

  if (!hasSelectedNFTs) {
    return <></>;
  }

  if (hasSelectedNFTs && !selectedLoan.amountBorrow) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center w-full bg-white text-black h-7 rounded-lg">
          <span>how much borrow?</span>
        </div>
      </div>
    );
  }

  if (hasSelectedNFTs && selectedLoan.amountBorrow) {
    return (
      <div className={className}>
        <LoanDetailsBar
          collectionAddress={selectedLoan.collectionAddress!}
          tokenIds={selectedLoan.tokenIds}
          riskLevel={selectedLoan.riskLevel!}
          type="borrow"
          amount={amountBorrowInEth}
        />
      </div>
    );
  }

  return <></>;
}

type LoanDetailsBarProps = {
  collectionAddress: string;
  tokenIds: string[];
  riskLevel: RiskLevel;
  type: "borrow" | "repay";
  amount: ethers.BigNumber | null;
};

function LoanDetailsBar({
  collectionAddress,
  tokenIds,
  riskLevel,
  type,
  amount,
}: LoanDetailsBarProps) {
  const { underlying } = usePaprController();
  const formattedAmount = useMemo(() => {
    if (!amount) return "...";
    return (
      formatBigNum(amount, underlying.decimals, 3) + ` ${underlying.symbol}`
    );
  }, [amount, underlying.decimals, underlying.symbol]);

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
