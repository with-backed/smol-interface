import { useCallback, useMemo, useState } from "react";
import type { LoanDetails } from "~/hooks/useLoan/useLoan";
import { useOracleSynced } from "~/hooks/useOracleSynced";
import { useVaultWrite } from "~/hooks/useVaultWrite";
import { VaultWriteType } from "~/hooks/useVaultWrite/helpers";
import type { VaultWithRiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";
import { OraclePriceType } from "~/lib/reservoir";
import { ApproveTokenButton } from "../ApproveButtons";
import { usePaprController } from "~/hooks/usePaprController";
import { TransactionButton } from "../Buttons/TransactionButton";
import { Address, erc20ABI, useAccount, useContractRead } from "wagmi";

type RepayProps = {
  vault: NonNullable<VaultWithRiskLevel>;
  loanDetails: LoanDetails;
  buttonText: string;
  refresh: () => void;
  disabled?: boolean;
};

export function Repay({
  vault,
  loanDetails,
  buttonText,
  refresh,
  disabled = false,
}: RepayProps) {
  const { address } = useAccount();
  const { id, underlying } = usePaprController();
  const oracleSynced = useOracleSynced(vault.token.id, OraclePriceType.lower);
  const [underlyingApproved, setUnderlyingApproved] = useState<boolean>(false);
  const { data: underlyingBalance } = useContractRead({
    address: underlying.id as Address,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address as Address],
  });

  const notEnoughWeth = useMemo(() => {
    if (!underlyingBalance || !loanDetails.totalOwed) return false;

    return underlyingBalance.lt(loanDetails.totalOwed);
  }, [underlyingBalance, loanDetails.totalOwed]);

  const repayDisabled = useMemo(() => {
    return (
      !underlyingApproved ||
      !oracleSynced ||
      loanDetails.vaultDebt.isZero() ||
      notEnoughWeth ||
      disabled
    );
  }, [
    underlyingApproved,
    oracleSynced,
    loanDetails.vaultDebt,
    disabled,
    notEnoughWeth,
  ]);

  const vaultNFTs = useMemo(() => {
    return loanDetails.vaultNFTs;
  }, [loanDetails.vaultNFTs]);
  const repaymentQuote = useMemo(() => {
    return loanDetails.repaymentQuote;
  }, [loanDetails.repaymentQuote]);
  const vaultDebt = useMemo(() => {
    return loanDetails.vaultDebt;
  }, [loanDetails.vaultDebt]);

  const setRecentActions = useGlobalStore((s) => s.setRecentActions);
  const setHasRepaid = useCallback(() => {
    setRecentActions((actions) => ({
      ...actions,
      [vault.token.id]: { hasRepaid: true, hasClaimed: false },
    }));
  }, [vault.token.id, setRecentActions]);

  const refreshWithRecentAction = useCallback(() => {
    refresh();
    setHasRepaid();
  }, [refresh, setHasRepaid]);

  const { data, write, error } = useVaultWrite({
    writeType: VaultWriteType.RepayWithSwap,
    collateralContractAddress: vault.token.id,
    depositNFTs: [],
    withdrawNFTs: vaultNFTs,
    amount: repaymentQuote,
    quote: vaultDebt,
    usingSafeTransferFrom: false,
    disabled: repayDisabled,
    refresh: refreshWithRecentAction,
  });

  return (
    <div className="graph-papr flex flex-col justify-center items-center gap-2 py-16">
      {notEnoughWeth && (
        <p className="text-black">Insufficient {underlying.symbol} balance!</p>
      )}
      {!underlyingApproved && (
        <div>
          <ApproveTokenButton
            token={underlying}
            spender={id}
            minApprovalRequired={loanDetails.totalOwed}
            theme={`bg-${vault.riskLevel}`}
            tokenApproved={underlyingApproved}
            setTokenApproved={setUnderlyingApproved}
          />
        </div>
      )}
      <div>
        <TransactionButton
          text={!oracleSynced ? "Waiting for oracle..." : buttonText}
          theme={`bg-${vault.riskLevel}`}
          onClick={write!}
          transactionData={data}
          disabled={repayDisabled}
          error={error?.message}
        />
      </div>
    </div>
  );
}
