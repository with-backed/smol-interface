import { useCallback } from "react";
import { Button } from "~/components/Buttons/Button";
import { useHeaderStore, HeaderState } from "~/components/Header";
import { useHeaderDisclosureState } from "~/hooks/useHeaderDisclosureState";

export default function Intro() {
  const { toggle } = useHeaderDisclosureState();
  const { state, setHeaderState } = useHeaderStore();

  const handleClick = useCallback(() => {
    if (state !== HeaderState.Default) {
      // Don't handle this click if we're already in the flow
      return;
    }

    setHeaderState(HeaderState.ListEligibleCollections);
    toggle();
  }, [setHeaderState, state, toggle]);

  return (
    <div className="flex flex-col items-center p-4 gap-4 justify-center h-full grow graph-papr">
      <Button onClick={handleClick}>pick ur hero</Button>
      <p className="text-center">
        WARNING! your NFT will be at risk until ETH repaid. More borrow = More
        risky
      </p>
    </div>
  );
}
