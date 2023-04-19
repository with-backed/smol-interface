import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useGlobalStore } from "~/lib/globalStore";
import { LoanDetails } from "./";
import { ethers } from "ethers";

export function HeaderBar() {
  const { isConnected } = useAccount();
  const className = useMemo(() => {
    const justification = isConnected ? "justify-between" : "justify-center";
    return `flex items-center bg-black text-white relative px-4 min-h-[50px] ${justification}`;
  }, [isConnected]);

  const selectedVault = useGlobalStore((s) => s.selectedVault);
  const inProgressLoan = useGlobalStore((s) => s.inProgressLoan);
  const hasSelectedNFTs = useMemo(
    () => inProgressLoan && inProgressLoan.tokenIds.length > 0,
    [inProgressLoan]
  );

  if (!inProgressLoan) {
    if (selectedVault) {
      return (
        <div className={className}>
          <LoanDetails
            collectionAddress={selectedVault.token.id}
            tokenIds={selectedVault.collateral.map((c) => c.tokenId)}
            riskLevel={selectedVault.riskLevel}
            type="repay"
            amountToBorrowOrRepay={ethers.BigNumber.from(selectedVault.debt)}
          />
        </div>
      );
    }
    return <></>;
  }

  if (hasSelectedNFTs && !inProgressLoan.amount) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center w-full bg-white text-black h-7 rounded-lg">
          <span>how much borrow?</span>
        </div>
      </div>
    );
  }

  if (hasSelectedNFTs && inProgressLoan.amount) {
    return (
      <div className={className}>
        <LoanDetails
          collectionAddress={inProgressLoan.collectionAddress}
          tokenIds={inProgressLoan.tokenIds}
          riskLevel={inProgressLoan.riskLevel!} // amount and risk level get updated in lock step
          type="borrow"
          amountToBorrowOrRepay={inProgressLoan.amount}
        />
      </div>
    );
  }

  return <></>;
}
