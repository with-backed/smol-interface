import { ethers } from "ethers";
import { useMemo } from "react";
import { erc20ABI, useAccount, useContractRead } from "wagmi";
import {
  AuctionWithRepay,
  AuctionWithClaim,
} from "~/components/AuctionScreens";
import { BorrowConnected, BorrowUnconnected } from "~/components/Borrow";
import { LoanSummaryContent } from "~/components/LoanSummary";
import { usePaprController } from "~/hooks/usePaprController";
import { isAuctionWithRepay, isAuctionWithClaim } from "~/lib/auctionStates";
import { inProgressLoanFilledOut, useGlobalStore } from "~/lib/globalStore";

export default function Five() {
  const { address, isConnected } = useAccount();
  const { paprToken } = usePaprController();

  const inProgressLoan = useGlobalStore((s) => s.inProgressLoan);
  const selectedVault = useGlobalStore((s) => s.selectedVault);

  const { data: paprBalance } = useContractRead({
    address: paprToken.id as `0x${string}`,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  const showAuctionWithRepay = useMemo(() => {
    if (!selectedVault) return false;
    return isAuctionWithRepay(selectedVault);
  }, [selectedVault]);

  const showAuctionWithClaim = useMemo(() => {
    if (!selectedVault || !paprBalance) return false;
    return isAuctionWithClaim(selectedVault, paprBalance);
  }, [selectedVault, paprBalance]);

  if (!isConnected) {
    return <BorrowUnconnected />;
  }

  if (inProgressLoan) {
    if (inProgressLoanFilledOut(inProgressLoan)) {
      return (
        <BorrowConnected
          collateralContractAddress={inProgressLoan.collectionAddress}
          tokenIds={inProgressLoan.tokenIds}
          riskLevel={inProgressLoan.riskLevel!} // guaranteed to be filled out if inProgressLoanFilledOut is true
          amount={inProgressLoan.amount!} // guaranteed to be filled out if inProgressLoanFilledOut is true
        />
      );
    }

    return <></>; // I still think we should have some message here indicating that the user needs to fill out more loan details
  }

  if (selectedVault) {
    if (!paprBalance) return <></>; // papr balance data loading

    if (showAuctionWithRepay) {
      return <AuctionWithRepay vault={selectedVault} />;
    }

    if (showAuctionWithClaim) {
      return <AuctionWithClaim vault={selectedVault} />;
    }

    return <LoanSummaryContent collateralAddress={selectedVault.token.id} />;
  }

  return <BorrowUnconnected />;
}
