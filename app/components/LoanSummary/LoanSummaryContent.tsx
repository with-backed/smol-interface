import { useVault } from "~/hooks/useVault";
import { LoanDetails } from "./LoanDetails";
import { useCallback } from "react";
import { LoanSummaryRepay } from "./";

type LoanSummaryContentProps = {
  collateralAddress: string;
};

export function LoanSummaryContent({
  collateralAddress,
}: LoanSummaryContentProps) {
  const { vaultData, fetching, refreshVault } = useVault(collateralAddress);

  const refresh = useCallback(() => {
    refreshVault({ requestPolicy: "cache-and-network" });
  }, [refreshVault]);

  if (fetching || !vaultData?.vault)
    return (
      <div className="h-full w-full flex flex-col">
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
    <div className="h-full w-full flex flex-col">
      <LoanSummaryRepay vault={vaultData.vault} refresh={refresh} />
    </div>
  );
}
