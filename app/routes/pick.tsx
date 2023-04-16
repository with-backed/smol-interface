import { Button } from "~/components/Buttons/Button";

export default function Intro() {
  return (
    <div className="flex flex-col items-center p-4 gap-4 justify-center h-full grow graph-papr">
      <Button>pick ur hero</Button>
      <p className="text-center">
        WARNING! your NFT will be at risk until ETH repaid. More borrow = More
        risky
      </p>
    </div>
  );
}
