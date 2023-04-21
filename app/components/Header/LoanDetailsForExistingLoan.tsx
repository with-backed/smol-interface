import { ethers } from "ethers";
import { VaultWithRiskLevel } from "~/lib/globalStore";
import { LoanDetails } from "./LoanDetails";
import {
  isCurrentAuctionWithRepay,
  isPastAuctionWithClaim,
  isPastAuctionWithRepay,
} from "~/lib/auctionStates";
import { useMemo } from "react";
import { usePaprController } from "~/hooks/usePaprController";
import { erc20ABI, useAccount, useContractRead } from "wagmi";
import { useTokenIdsForVault } from "~/hooks/useTokenIdsForVault";

type LoanDetailsForExistingLoanProps = {
  vault: NonNullable<VaultWithRiskLevel>;
};

// convenience wrapper component over LoanDetails for rendering the correct version
// of that component based on a vaults liquidation status, if any
export function LoanDetailsForExistingLoan({
  vault,
}: LoanDetailsForExistingLoanProps) {
  const { paprToken } = usePaprController();
  const { address } = useAccount();
  const { data: paprBalance } = useContractRead({
    address: paprToken.id as `0x${string}`,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  const tokenIdsForDetails = useTokenIdsForVault(vault);

  const showCurrentAuctionWithRepay = useMemo(() => {
    if (!vault) return false;
    return isCurrentAuctionWithRepay(vault);
  }, [vault]);

  const showPastAuctionWithRepay = useMemo(() => {
    if (!vault) return false;

    return isPastAuctionWithRepay(vault);
  }, [vault]);

  const showPastAuctionWithClaim = useMemo(() => {
    if (!vault || !paprBalance) return false;
    return isPastAuctionWithClaim(vault, paprBalance);
  }, [vault, paprBalance]);

  if (!paprBalance) return <></>; // papr balance data loading

  if (showCurrentAuctionWithRepay) {
    return (
      <LoanDetails
        collectionAddress={vault.token.id}
        tokenIds={tokenIdsForDetails}
        riskLevel={vault.riskLevel}
        action="liquidating"
        amountToBorrowOrRepay={ethers.BigNumber.from(vault.debt)}
      />
    );
  }

  if (showPastAuctionWithRepay || showPastAuctionWithClaim) {
    return (
      <LoanDetails
        collectionAddress={vault.token.id}
        tokenIds={tokenIdsForDetails}
        riskLevel={vault.riskLevel}
        action="liquidated"
        amountToBorrowOrRepay={ethers.BigNumber.from(vault.debt)}
      />
    );
  }

  return (
    <LoanDetails
      collectionAddress={vault.token.id}
      tokenIds={tokenIdsForDetails}
      riskLevel={vault.riskLevel}
      action="repay"
      amountToBorrowOrRepay={ethers.BigNumber.from(vault.debt)}
    />
  );
}
