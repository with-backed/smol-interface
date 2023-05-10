import { ethers } from "ethers";
import type { VaultWithRiskLevel } from "~/lib/globalStore";
import { LoanDetails } from "./LoanDetails";
import { isAuctionWithRepay, isAuctionWithClaim } from "~/lib/auctionStates";
import { useMemo } from "react";
import { usePaprController } from "~/hooks/usePaprController";
import { erc20ABI, useAccount, useContractRead } from "wagmi";
import { useTokenIdsForVault } from "~/hooks/useTokenIdsForVault";

type LoanDetailsForExistingLoanProps = {
  vault: VaultWithRiskLevel;
  handleClick: () => void;
};

// convenience wrapper component over LoanDetails for rendering the correct version
// of that component based on a vaults liquidation status, if any
export function LoanDetailsForExistingLoan({
  vault,
  handleClick,
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

  const showAuctionWithRepay = useMemo(() => {
    if (!vault) return false;
    return isAuctionWithRepay(vault);
  }, [vault]);

  const showAuctionWithClaim = useMemo(() => {
    if (!vault || !paprBalance) return false;
    return isAuctionWithClaim(vault, paprBalance);
  }, [vault, paprBalance]);

  if (!paprBalance) return <></>; // papr balance data loading

  if (showAuctionWithRepay) {
    return (
      <LoanDetails
        collectionAddress={vault.token.id}
        tokenIds={tokenIdsForDetails}
        riskLevel={vault.riskLevel}
        action={vault.ongoingAuctions.length > 0 ? "liquidating" : "liquidated"}
        amount={ethers.BigNumber.from(vault.debt)}
        handleClick={handleClick}
      />
    );
  }

  if (showAuctionWithClaim) {
    return (
      <LoanDetails
        collectionAddress={vault.token.id}
        tokenIds={tokenIdsForDetails}
        riskLevel={vault.riskLevel}
        action="claim"
        amount={ethers.BigNumber.from(0)}
        handleClick={handleClick}
      />
    );
  }

  return (
    <LoanDetails
      collectionAddress={vault.token.id}
      tokenIds={tokenIdsForDetails}
      riskLevel={vault.riskLevel}
      action="repay"
      amount={ethers.BigNumber.from(vault.debt)}
      handleClick={handleClick}
    />
  );
}
