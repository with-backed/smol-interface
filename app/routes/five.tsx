import { getAddress } from "ethers/lib/utils.js";
import { useMemo } from "react";
import { BorrowContent } from "~/components/Borrow";
import { LoanSummaryContent } from "~/components/LoanSummary";
import { useGlobalStore } from "~/lib/globalStore";

export default function Five() {
  const currentVaults = useGlobalStore((s) => s.currentVaults);
  const refreshCurrentVaults = useGlobalStore((s) => s.refreshCurrentVaults);
  const selectedContractAddress = useGlobalStore(
    (s) => s.selectedLoan.collectionAddress
  );

  const vault = useMemo(() => {
    if (!selectedContractAddress) return undefined;
    return currentVaults?.find(
      (v) => getAddress(v.token.id) === getAddress(selectedContractAddress)
    );
  }, [currentVaults, selectedContractAddress]);

  if (!selectedContractAddress) return <></>;

  if (vault) {
    return <LoanSummaryContent collateralAddress={vault.token.id} />;
  }

  return (
    <BorrowContent
      collateralContractAddress={selectedContractAddress!}
      refresh={refreshCurrentVaults}
    />
  );
}
