import { ethers } from "ethers";
import { useMemo } from "react";
import { erc20ABI, useAccount, useContractRead } from "wagmi";
import {
  OngoingAuctionWithRepay,
  PastAuctionWithClaim,
} from "~/components/AuctionScreens";
import { PastAuctionWithRepay } from "~/components/AuctionScreens";
import { BorrowContent } from "~/components/Borrow";
import { LoanSummaryContent } from "~/components/LoanSummary";
import { usePaprController } from "~/hooks/usePaprController";
import { isPastAuctionWithClaim } from "~/lib/auctionStates";
import { isPastAuctionWithRepay } from "~/lib/auctionStates";
import { isCurrentAuctionWithRepay } from "~/lib/auctionStates";
import { inProgressLoanFilledOut, useGlobalStore } from "~/lib/globalStore";

export default function Five() {
  const { address } = useAccount();
  const { paprToken } = usePaprController();

  const inProgressLoan = useGlobalStore((s) => s.inProgressLoan);
  const selectedVault = useGlobalStore((s) => s.selectedVault);

  const { data: paprBalance } = useContractRead({
    address: paprToken.id as `0x${string}`,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  const showCurrentAuctionWithRepay = useMemo(() => {
    if (!selectedVault) return false;
    return isCurrentAuctionWithRepay(selectedVault);
  }, [selectedVault]);

  const showPastAuctionWithRepay = useMemo(() => {
    if (!selectedVault) return false;

    return isPastAuctionWithRepay(selectedVault);
  }, [selectedVault]);

  const showPastAuctionWithClaim = useMemo(() => {
    if (!selectedVault || !paprBalance) return false;
    return isPastAuctionWithClaim(selectedVault, paprBalance);
  }, [selectedVault, paprBalance]);

  if (inProgressLoan) {
    if (inProgressLoanFilledOut(inProgressLoan)) {
      return (
        <BorrowContent
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

    if (showCurrentAuctionWithRepay) {
      return <OngoingAuctionWithRepay vault={selectedVault} />;
    }

    if (showPastAuctionWithRepay) {
      return <PastAuctionWithRepay vault={selectedVault} />;
    }

    if (showPastAuctionWithClaim) {
      return <PastAuctionWithClaim vault={selectedVault} />;
    }

    return <LoanSummaryContent collateralAddress={selectedVault.token.id} />;
  }

  return <></>;
}
