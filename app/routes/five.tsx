import { BorrowContent } from "~/components/Borrow";
import { LoanSummaryContent } from "~/components/LoanSummary";
import { useGlobalStore } from "~/lib/globalStore";

export default function Five() {
  const inProgressLoan = useGlobalStore((s) => s.inProgressLoan);
  const selectedVault = useGlobalStore((s) => s.selectedVault);

  if (inProgressLoan.collectionAddress) {
    return (
      <BorrowContent
        collateralContractAddress={inProgressLoan.collectionAddress}
      />
    );
  }

  if (selectedVault) {
    return <LoanSummaryContent collateralAddress={selectedVault.token.id} />;
  }

  return <></>;
}
