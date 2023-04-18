import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useGlobalStore } from "~/lib/globalStore";
import { LoanDetails } from "./";

export function HeaderBar() {
  const { isConnected } = useAccount();
  const className = useMemo(() => {
    const justification = isConnected ? "justify-between" : "justify-center";
    return `flex items-center bg-black text-white relative px-4 min-h-[50px] ${justification}`;
  }, [isConnected]);

  const selectedLoan = useGlobalStore((s) => s.selectedLoan);

  const hasSelectedNFTs = useMemo(() => {
    return !!selectedLoan.collectionAddress && selectedLoan.tokenIds.length > 0;
  }, [selectedLoan.collectionAddress, selectedLoan.tokenIds.length]);

  if (!hasSelectedNFTs) {
    return <></>;
  }

  if (
    hasSelectedNFTs &&
    !selectedLoan.amountBorrow &&
    !selectedLoan.amountRepay
  ) {
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
        <LoanDetails
          collectionAddress={selectedLoan.collectionAddress!}
          tokenIds={selectedLoan.tokenIds}
          riskLevel={selectedLoan.riskLevel!}
          type="borrow"
          amountToBorrowOrRepay={selectedLoan.amountBorrow}
        />
      </div>
    );
  }

  if (hasSelectedNFTs && selectedLoan.amountRepay) {
    return (
      <div className={className}>
        <LoanDetails
          collectionAddress={selectedLoan.collectionAddress!}
          tokenIds={selectedLoan.tokenIds}
          riskLevel={selectedLoan.riskLevel!}
          type="repay"
          amountToBorrowOrRepay={selectedLoan.amountRepay}
        />
      </div>
    );
  }

  return <></>;
}
