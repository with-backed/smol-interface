import { useLoan } from "~/hooks/useLoan";
import { usePaprController } from "~/hooks/usePaprController";
import { ApproveTokenButton } from "~/components/ApproveButtons";
import { useMemo, useState } from "react";
import { useVaultWrite } from "~/hooks/useVaultWrite";
import { VaultWriteType } from "~/hooks/useVaultWrite/helpers";
import { TransactionButton } from "~/components/Buttons/TransactionButton";
import { useOracleSynced } from "~/hooks/useOracleSynced";
import { OraclePriceType } from "~/lib/reservoir";
import type { SubgraphVault } from "~/hooks/useVault";
import { LoanDetails } from "./LoanDetails";

type LoanSummaryRepayProps = {
  vault: NonNullable<SubgraphVault>;
  refresh: () => void;
};

export function LoanSummaryRepay({ vault, refresh }: LoanSummaryRepayProps) {
  const { underlying } = usePaprController();
  const oracleSynced = useOracleSynced(vault.token.id, OraclePriceType.lower);
  const [underlyingApproved, setUnderlyingApproved] = useState<boolean>(false);
  const repayDisabled = useMemo(() => {
    return !underlyingApproved || !oracleSynced;
  }, [underlyingApproved, oracleSynced]);

  const {
    borrowedPapr,
    repaymentQuote,
    formattedBorrowed,
    formattedTotalRepayment,
    formattedInterest,
    formattedCostPercentage,
    numDays,
    vaultNFTs,
  } = useLoan(vault);

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
    <>
      <LoanDetails
        borrowed={formattedBorrowed}
        interest={formattedInterest}
        totalRepayment={formattedTotalRepayment}
        numDays={numDays}
        costPercentage={formattedCostPercentage}
      />
      <div className="my-4">
        <img src="/instrument.png" />
      </div>
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
                : `Repay ${formattedTotalRepayment}`
            }
            theme="bg-rekt"
            onClick={write!}
            transactionData={data}
            disabled={!underlyingApproved || !oracleSynced}
            error={error?.message}
          />
        </div>
      </div>
    </>
  );
}
