import { BorrowContent } from "~/components/Borrow";
import { LoanSummaryContent } from "~/components/LoanSummary";
import { inProgressLoanFilledOut, useGlobalStore } from "~/lib/globalStore";

export default function Five() {
  const inProgressLoan = useGlobalStore((s) => s.inProgressLoan);
  const selectedVault = useGlobalStore((s) => s.selectedVault);

  if (inProgressLoan) {
    if (inProgressLoanFilledOut(inProgressLoan)) {
      return (
        <BorrowContent
          collateralContractAddress={inProgressLoan.collectionAddress}
          tokenIds={inProgressLoan.tokenIds}
          riskLevel={inProgressLoan.riskLevel}
          amount={inProgressLoan.amount!} // guaranteed to be filled out if inProgressLoanFilledOut is true
        />
      );
    }

    return <></>; // I still think we should have some message here indicating that the user needs to fill out more loan details
  }

  if (selectedVault) {
    return <LoanSummaryContent collateralAddress={selectedVault.token.id} />;
  }

  return <></>;
}
