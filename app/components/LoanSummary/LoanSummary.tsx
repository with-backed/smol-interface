export function LoanSummary() {
  return (
    <div className="w-full flex flex-col">
      <div className="flex-initial flex flex-col p-10">
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Borrowed:</p>
          </div>
          <div>
            <p>1.114 ETH</p>
          </div>
        </div>
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Cost (0 days):</p>
          </div>
          <div>
            <p>0.0460 ETH</p>
          </div>
        </div>
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Total Repayment:</p>
          </div>
          <div>
            <p>1.160 ETH</p>
          </div>
        </div>
      </div>
      <div className="my-4">
        <img src="/instrument.png" />
      </div>
      <div className="graphPapr flex-auto flex flex-col justify-center items-center">
        <button className="bg-adventureYellow p-2 rounded-lg w-48">
          Repay 1.160 ETH
        </button>
      </div>
    </div>
  );
}
