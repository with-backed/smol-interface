import { useLoan } from "~/hooks/useLoan";
import { usePaprController } from "~/hooks/usePaprController";
import { ApproveTokenButton } from "~/components/ApproveButtons";
import { useMemo, useState } from "react";
import { useVaultWrite } from "~/hooks/useVaultWrite";
import { VaultWriteType } from "~/hooks/useVaultWrite/helpers";
import { TransactionButton } from "~/components/Buttons/TransactionButton";
import { useOracleSynced } from "~/hooks/useOracleSynced";
import { OraclePriceType } from "~/lib/reservoir";

type LoanSummaryProps = {
  collateralAddress: string;
};

export function LoanSummary({ collateralAddress }: LoanSummaryProps) {
  const { id, underlying } = usePaprController();
  const oracleSynced = useOracleSynced(
    collateralAddress,
    OraclePriceType.lower
  );
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
  } = useLoan(id, collateralAddress);

  const { data, write, error } = useVaultWrite({
    writeType: VaultWriteType.RepayWithSwap,
    collateralContractAddress: collateralAddress,
    depositNFTs: [],
    withdrawNFTs: vaultNFTs,
    amount: repaymentQuote,
    quote: borrowedPapr,
    usingSafeTransferFrom: false,
    disabled: repayDisabled,
    refresh: () => null,
  });

  return (
    <div className="w-full flex flex-col">
      <div className="flex-initial flex flex-col p-6">
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Borrowed:</p>
          </div>
          <div>
            <p>{formattedBorrowed}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Cost:</p>
          </div>
          <div>
            <p>{formattedInterest}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Total Repayment:</p>
          </div>
          <div>
            <p>{formattedTotalRepayment}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>({numDays} day) cost as %: </p>
          </div>
          <div>
            <p>{formattedCostPercentage}</p>
          </div>
        </div>
      </div>
      <div className="my-4">
        <img src="/instrument.png" />
      </div>
      <div className="graphPapr flex-auto flex flex-col justify-center items-center">
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
    </div>
  );
}
