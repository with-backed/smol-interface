import { useMemo } from "react";
import { BorrowContent } from "~/components/Borrow";
import { LoanSummaryContent } from "~/components/LoanSummary";
import { useGlobalStore } from "~/lib/globalStore";

export default function Five() {
  const currentVaults = useGlobalStore((s) => s.currentVaults);
  const selectedContractAddress = useGlobalStore(
    (s) => s.selectedLoan.collectionAddress
  );

  const vault = useMemo(() => {
    return currentVaults?.find((v) => v.token.id === selectedContractAddress);
  }, [currentVaults, selectedContractAddress]);

  if (vault) {
    return <LoanSummaryContent collateralAddress={vault.token.id} />;
  }

  return <BorrowContent collateralContractAddress={selectedContractAddress!} />;
}
