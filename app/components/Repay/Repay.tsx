import { useMemo, useState } from "react";
import { LoanDetails } from "~/hooks/useLoan/useLoan";
import { useOracleSynced } from "~/hooks/useOracleSynced";
import { SubgraphVault } from "~/hooks/useVault";
import { useVaultWrite } from "~/hooks/useVaultWrite";
import { VaultWriteType } from "~/hooks/useVaultWrite/helpers";
import { VaultWithRiskLevel } from "~/lib/globalStore";
import { OraclePriceType } from "~/lib/reservoir";
import { ApproveTokenButton } from "../ApproveButtons";
import { usePaprController } from "~/hooks/usePaprController";
import { TransactionButton } from "../Buttons/TransactionButton";

type RepayProps = {
  vault: NonNullable<VaultWithRiskLevel>;
  loanDetails: LoanDetails;
  refresh: () => void;
};

export function Repay({ vault, loanDetails, refresh }: RepayProps) {
  const { underlying } = usePaprController();
  const oracleSynced = useOracleSynced(vault.token.id, OraclePriceType.lower);
  const [underlyingApproved, setUnderlyingApproved] = useState<boolean>(false);
  const repayDisabled = useMemo(() => {
    return !underlyingApproved || !oracleSynced;
  }, [underlyingApproved, oracleSynced]);

  const vaultNFTs = useMemo(() => {
    return loanDetails.vaultNFTs;
  }, [loanDetails.vaultNFTs]);
  const repaymentQuote = useMemo(() => {
    return loanDetails.repaymentQuote;
  }, [loanDetails.repaymentQuote]);
  const borrowedPapr = useMemo(() => {
    return loanDetails.borrowedPapr;
  }, [loanDetails.borrowedPapr]);

  const { data, write, error } = useVaultWrite({
    writeType: VaultWriteType.RepayWithSwap,
    collateralContractAddress: vault.token.id,
    depositNFTs: [],
    withdrawNFTs: vaultNFTs,
    amount: repaymentQuote,
    quote: borrowedPapr,
    usingSafeTransferFrom: false,
    disabled: repayDisabled,
    refresh,
  });

  return (
    <div className="graph-papr flex-auto flex flex-col justify-center items-center">
      {!underlyingApproved && (
        <div className="my-2">
          <ApproveTokenButton
            token={underlying}
            theme="bg-rekt-faint"
            tokenApproved={underlyingApproved}
            setTokenApproved={setUnderlyingApproved}
          />
        </div>
      )}
      <div className="my-2">
        <TransactionButton
          text={
            !oracleSynced
              ? "Waiting for oracle..."
              : `Repay ${loanDetails.formattedTotalRepayment}`
          }
          theme={`bg-${vault.riskLevel}`}
          onClick={write!}
          transactionData={data}
          disabled={!underlyingApproved || !oracleSynced}
          error={error?.message}
        />
      </div>
    </div>
  );
}
