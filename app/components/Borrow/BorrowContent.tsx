import { useGlobalStore } from "~/lib/globalStore";
import { usePoolQuote } from "~/hooks/usePoolQuote";
import { usePaprController } from "~/hooks/usePaprController";
import { useVaultWrite } from "~/hooks/useVaultWrite";
import { VaultWriteType } from "~/hooks/useVaultWrite/helpers";
import { getUniqueNFTId } from "~/lib/utils";
import { useEffect, useMemo } from "react";
import { OraclePriceType } from "~/lib/reservoir";
import { useOracleSynced } from "~/hooks/useOracleSynced";
import { formatBigNum } from "~/lib/numberFormat";
import { TransactionButton } from "../Buttons/TransactionButton";
import { getAddress } from "ethers/lib/utils.js";

type BorrowContentProps = {
  collateralContractAddress: string;
};

export function BorrowContent({
  collateralContractAddress,
}: BorrowContentProps) {
  const inProgressLoan = useGlobalStore((s) => s.inProgressLoan);
  const clearInProgressLoan = useGlobalStore((s) => s.clear);
  const currentVaults = useGlobalStore((s) => s.currentVaults);
  const refresh = useGlobalStore((s) => s.refreshCurrentVaults);
  const setSelectedVault = useGlobalStore((s) => s.setSelectedVault);

  // when the user has borrowed, update the selected vault to be the fresh one that comes
  // in from the subgraph refresh
  useEffect(() => {
    if (!currentVaults) return;
    const vaultForBorrow = currentVaults.find(
      (v) => getAddress(v.token.id) === getAddress(collateralContractAddress)
    );
    if (vaultForBorrow) {
      setSelectedVault({
        ...vaultForBorrow,
        riskLevel: inProgressLoan.riskLevel,
      });
      clearInProgressLoan();
    }
  }, [
    currentVaults,
    collateralContractAddress,
    inProgressLoan.riskLevel,
    setSelectedVault,
    clearInProgressLoan,
  ]);

  const { paprToken, underlying } = usePaprController();

  const depositNFTs = useMemo(() => {
    return inProgressLoan.tokenIds.map((tokenId) =>
      getUniqueNFTId(collateralContractAddress, tokenId)
    );
  }, [inProgressLoan.tokenIds, collateralContractAddress]);
  const usingSafeTransferFrom = useMemo(() => {
    return depositNFTs.length === 1;
  }, [depositNFTs]);

  const amountBorrowInEth = usePoolQuote({
    amount: inProgressLoan.amount,
    inputToken: paprToken.id,
    outputToken: underlying.id,
    tradeType: "exactIn",
    skip: !inProgressLoan.amount,
  });
  const formattedBorrow = useMemo(() => {
    if (!amountBorrowInEth) return "...";
    return (
      formatBigNum(amountBorrowInEth, underlying.decimals, 3) +
      ` ${underlying.symbol}`
    );
  }, [amountBorrowInEth, underlying.decimals, underlying.symbol]);

  const oracleSynced = useOracleSynced(
    collateralContractAddress,
    OraclePriceType.lower
  );
  const { data, write, error } = useVaultWrite({
    writeType: VaultWriteType.BorrowWithSwap,
    collateralContractAddress: collateralContractAddress,
    depositNFTs: depositNFTs,
    withdrawNFTs: [],
    amount: inProgressLoan.amount,
    quote: amountBorrowInEth,
    usingSafeTransferFrom,
    disabled: !oracleSynced,
    refresh,
  });

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="w-full flex flex-col items-center p-8">
        <div className="w-4/6 text-center">
          <p>GET ETH NOW RESCUE TOAD LATER</p>
        </div>
        <div className="my-4 mt-16">
          <img src="/instrument.png" />
        </div>
      </div>
      <div className="graph-papr flex-auto flex flex-col justify-center items-center">
        <TransactionButton
          text={
            !oracleSynced
              ? "Waiting for oracle..."
              : `Borrow ${formattedBorrow}`
          }
          theme={`bg-${inProgressLoan.riskLevel}`}
          onClick={write!}
          transactionData={data}
          disabled={!oracleSynced}
          error={error?.message}
        />
      </div>
    </div>
  );
}
