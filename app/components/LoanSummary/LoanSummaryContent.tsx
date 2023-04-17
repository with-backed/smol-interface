import { useVault } from "~/hooks/useVault";
import { LoanDetails } from "./LoanDetails";
import { ethers } from "ethers";
import { useCallback, useMemo } from "react";
import { LoanSummaryRepay, LoanSummaryRepaid } from "./";

type LoanSummaryContentProps = {
  collateralAddress: string;
};

export function LoanSummaryContent({
  collateralAddress,
}: LoanSummaryContentProps) {
  const { vaultData, fetching, refreshVault } = useVault(collateralAddress);

  const vaultHasDebt = useMemo(() => {
    if (!vaultData?.vault) return null;
    return !ethers.BigNumber.from(vaultData.vault.debt).isZero();
  }, [vaultData]);

  const refresh = useCallback(() => {
    refreshVault({ requestPolicy: "cache-and-network" });
  }, [refreshVault]);

  if (fetching || !vaultData?.vault)
    return (
      <div className="w-full flex flex-col">
        <LoanDetails
          borrowed="..."
          costPercentage="..."
          interest="..."
          numDays={null}
          totalRepayment="..."
        />
      </div>
    );

  return (
    <div className="w-full flex flex-col">
      {vaultHasDebt && (
        <LoanSummaryRepay vault={vaultData.vault} refresh={refresh} />
      )}
      {!vaultHasDebt && <LoanSummaryRepaid vault={vaultData.vault} />}
    </div>
  );
}
