import type { RiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";
import { usePoolQuote } from "~/hooks/usePoolQuote";
import { usePaprController } from "~/hooks/usePaprController";
import { useVaultWrite } from "~/hooks/useVaultWrite";
import { VaultWriteType } from "~/hooks/useVaultWrite/helpers";
import { getUniqueNFTId } from "~/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { OraclePriceType } from "~/lib/reservoir";
import { useOracleSynced } from "~/hooks/useOracleSynced";
import { formatBigNum } from "~/lib/numberFormat";
import { TransactionButton } from "../Buttons/TransactionButton";
import { getAddress } from "ethers/lib/utils.js";
import type { ethers } from "ethers";
import { Button } from "../Buttons/Button";
import { ApproveNFTButton } from "../ApproveButtons";

type BorrowConnectedProps = {
  collateralContractAddress: string;
  tokenIds: string[];
  riskLevel: RiskLevel;
  amount: ethers.BigNumber;
};

export function BorrowConnected({
  collateralContractAddress,
  tokenIds,
  riskLevel,
  amount,
}: BorrowConnectedProps) {
  const { paprToken, underlying } = usePaprController();

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
        riskLevel,
      });
      clearInProgressLoan();
    }
  }, [
    currentVaults,
    collateralContractAddress,
    riskLevel,
    setSelectedVault,
    clearInProgressLoan,
  ]);

  const [collateralApproved, setCollateralApproved] = useState<boolean>(false);
  const depositNFTs = useMemo(() => {
    return tokenIds.map((tokenId) =>
      getUniqueNFTId(collateralContractAddress, tokenId)
    );
  }, [tokenIds, collateralContractAddress]);
  const usingSafeTransferFrom = useMemo(() => {
    return depositNFTs.length === 1;
  }, [depositNFTs]);

  const amountBorrowInEth = usePoolQuote({
    amount: amount,
    inputToken: paprToken.id,
    outputToken: underlying.id,
    tradeType: "exactIn",
    skip: !amount,
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
  const disabled = useMemo(() => {
    return !oracleSynced || (!collateralApproved && !usingSafeTransferFrom);
  }, [oracleSynced, collateralApproved, usingSafeTransferFrom]);
  const { data, write, error } = useVaultWrite({
    writeType: VaultWriteType.BorrowWithSwap,
    collateralContractAddress: collateralContractAddress,
    depositNFTs: depositNFTs,
    withdrawNFTs: [],
    amount: amount,
    quote: amountBorrowInEth,
    usingSafeTransferFrom,
    disabled,
    refresh,
  });

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="text-center py-4">
        <p>
          GET ETH NOW <br /> RESCUE TOAD LATER
        </p>
      </div>
      <div className="mt-auto">
        <img
          className="mb-[-25px] px-8"
          src="/5-instrument-super-dance.svg"
          alt="frog says: I am a financial instrument"
        />
        <div className="graph-papr flex flex-col justify-center items-center gap-2 py-16">
          {!usingSafeTransferFrom && !collateralApproved && (
            <div>
              <ApproveNFTButton
                collateralContractAddress={collateralContractAddress}
                theme={`bg-${riskLevel}`}
                setApproved={setCollateralApproved}
              />
            </div>
          )}
          <div>
            <TransactionButton
              text={
                !oracleSynced
                  ? "Waiting for oracle..."
                  : `Borrow ${formattedBorrow}`
              }
              theme={`bg-${riskLevel}`}
              onClick={write!}
              transactionData={data}
              disabled={disabled}
              error={error?.message}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BorrowUnconnected() {
  return (
    <div className="flex flex-col h-full items-center">
      <div className="w-3/5 text-center py-4">
        <p>
          GET ETH NOW <br /> RESCUE TOAD LATER
        </p>
      </div>
      <div className="mt-auto">
        <img
          className="mb-[-25px] px-8"
          src="/5-instrument-super-dance.svg"
          alt="frog says: I am a financial instrument"
        />
        <div className="graph-papr flex flex-col justify-center items-center py-16">
          <Button
            theme="bg-unclickable-grey"
            additionalClassNames={["text-[#B1B1B1]"]}
            disabled
          >
            Borrow $$$
          </Button>
        </div>
      </div>
    </div>
  );
}
