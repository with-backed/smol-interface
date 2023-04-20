import { ethers } from "ethers";
import { useMemo } from "react";
import { erc20ABI, useAccount, useContractRead } from "wagmi";
import { OngoingAuctionWithRepay } from "~/components/AuctionScreens";
import { PastAuctionWithRepay } from "~/components/AuctionScreens/PastAuctionWithRepay";
import { BorrowContent } from "~/components/Borrow";
import { LoanSummaryContent } from "~/components/LoanSummary";
import { usePaprController } from "~/hooks/usePaprController";
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
    return (
      selectedVault.ongoingAuctions.length > 0 &&
      !ethers.BigNumber.from(selectedVault.debt).isZero()
    );
  }, [selectedVault]);

  const showPastAuctionWithRepay = useMemo(() => {
    if (!selectedVault) return false;
    if (selectedVault.pastAuctions.length === 0) return false;

    const latestAuctionEndTime = selectedVault.pastAuctions.sort(
      (a, b) => b.end!.timestamp - a.end!.timestamp
    )[0].end!.timestamp;

    const latestBorrowBeforeAuction =
      selectedVault.latestIncreaseDebt < latestAuctionEndTime;

    return (
      latestBorrowBeforeAuction &&
      !ethers.BigNumber.from(selectedVault.debt).isZero()
    );
  }, [selectedVault]);

  const showPastAuctionWithClaim = useMemo(() => {
    if (!selectedVault || !paprBalance) return false;
    return (
      selectedVault.pastAuctions.length > 0 &&
      ethers.BigNumber.from(selectedVault.debt).isZero() &&
      paprBalance.gt(0)
    );
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
      <OngoingAuctionWithRepay vault={selectedVault} />;
    }

    if (showPastAuctionWithRepay) {
      <PastAuctionWithRepay vault={selectedVault} />;
    }

    if (showPastAuctionWithClaim) {
      // show successful auction with claim
    }

    return <LoanSummaryContent collateralAddress={selectedVault.token.id} />;
  }

  return <></>;
}
