import { useAccount } from "wagmi";
import { LoanSummary } from "~/components/LoanSummary/LoanSummary";

export default function Index() {
  return (
    <div className="wrapper flex flex-col bg-white">
      <div className="content flex h-full justify-center">
        <LoanSummary collateralAddress="0x79ab709dadc05cd2c0f7322bc7e3d70d2550942c" />
      </div>
    </div>
  );
}
