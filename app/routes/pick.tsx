import { Button } from "~/components/Buttons/Button";
import { useHeaderDisclosureState } from "~/hooks/useHeaderDisclosureState";

export default function Intro() {
  const { toggle } = useHeaderDisclosureState();
  return (
    <div className="flex flex-col items-center p-4 gap-4 justify-center h-full grow graph-papr">
      <Button onClick={toggle}>pick ur hero</Button>
      <p className="text-center">
        WARNING! your NFT will be at risk until ETH repaid. More borrow = More
        risky
      </p>
    </div>
  );
}
