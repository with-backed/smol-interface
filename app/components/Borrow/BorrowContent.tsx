import { useGlobalStore } from "~/lib/globalStore";
import { usePoolQuote } from "~/hooks/usePoolQuote";
import { usePaprController } from "~/hooks/usePaprController";
import { useVaultWrite } from "~/hooks/useVaultWrite";
import { VaultWriteType } from "~/hooks/useVaultWrite/helpers";
import { getUniqueNFTId } from "~/lib/utils";
import { useCallback, useMemo } from "react";
import { OraclePriceType } from "~/lib/reservoir";
import { useOracleSynced } from "~/hooks/useOracleSynced";
import { formatBigNum } from "~/lib/numberFormat";
import { TransactionButton } from "../Buttons/TransactionButton";

type BorrowContentProps = {
  collateralContractAddress: string;
  refresh: () => void;
};

export function BorrowContent({
  collateralContractAddress,
  refresh,
}: BorrowContentProps) {
  const { paprToken, underlying } = usePaprController();
  const selectedLoan = useGlobalStore((s) => s.selectedLoan);
  const setSelectedLoan = useGlobalStore((s) => s.setSelectedLoan);

  const refreshWithStateUpdate = useCallback(() => {
    setSelectedLoan((prev) => ({
      ...prev,
      amountBorrow: null,
      amountRepay: prev.amountBorrow,
      isExistingLoan: true,
    }));
    refresh();
  }, [setSelectedLoan, refresh]);

  const depositNFTs = useMemo(() => {
    return selectedLoan.tokenIds.map((tokenId) =>
      getUniqueNFTId(collateralContractAddress, tokenId)
    );
  }, [selectedLoan.tokenIds, collateralContractAddress]);
  const usingSafeTransferFrom = useMemo(() => {
    return depositNFTs.length === 1;
  }, [depositNFTs]);

  const amountBorrowInEth = usePoolQuote({
    amount: selectedLoan.amountBorrow,
    inputToken: paprToken.id,
    outputToken: underlying.id,
    tradeType: "exactIn",
    skip: !selectedLoan.amountBorrow,
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
    amount: selectedLoan.amountBorrow,
    quote: amountBorrowInEth,
    usingSafeTransferFrom,
    disabled: !oracleSynced,
    refresh: refreshWithStateUpdate,
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
          theme={`bg-${selectedLoan.riskLevel}`}
          onClick={write!}
          transactionData={data}
          disabled={!oracleSynced}
          error={error?.message}
        />
      </div>
    </div>
  );
}
