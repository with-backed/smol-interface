type LoanDetailsProps = {
  borrowed: string;
  interest: string;
  totalRepayment: string;
  numDays: number | null;
  costPercentage: string;
};

export function LoanDetails({
  borrowed,
  interest,
  totalRepayment,
  numDays,
  costPercentage,
}: LoanDetailsProps) {
  return (
    <div className="flex-initial flex flex-col p-6">
      <div className="flex flex-row justify-between py-1">
        <div>
          <p>Borrowed:</p>
        </div>
        <div>
          <p>{borrowed}</p>
        </div>
      </div>
      <div className="flex flex-row justify-between py-1">
        <div>
          <p>Cost:</p>
        </div>
        <div>
          <p>{interest}</p>
        </div>
      </div>
      <div className="flex flex-row justify-between py-1">
        <div>
          <p>Total Repayment:</p>
        </div>
        <div>
          <p>{totalRepayment}</p>
        </div>
      </div>
      <div className="flex flex-row justify-between py-1">
        <div>
          <p>({numDays} day) cost as %: </p>
        </div>
        <div>
          <p>{costPercentage}</p>
        </div>
      </div>
    </div>
  );
}
