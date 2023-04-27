import { useCallback } from "react";
import { Button } from "~/components/Buttons/Button";
import { HeaderState } from "~/components/Header";
import { useHeaderDisclosureState } from "~/hooks/useHeaderDisclosureState";
import { useGlobalStore } from "~/lib/globalStore";

export default function Intro() {
  const clear = useGlobalStore((s) => s.clear);
  const { toggle } = useHeaderDisclosureState();
  const { state, setHeaderState } = useGlobalStore();

  const handleClick = useCallback(() => {
    if (state !== HeaderState.Default) {
      // Don't handle this click if we're already in the flow
      return;
    }

    clear();
    setHeaderState(HeaderState.ListEligibleCollections);
    toggle();
  }, [clear, setHeaderState, state, toggle]);

  return (
    <div className="flex flex-col items-center p-4 gap-4 justify-center h-full grow graph-papr">
      <Button onClick={handleClick}>pick ur hero</Button>
      <div className="w-full flex flex-col items-center">
        <div>
          <p className="relative left-[76px] top-[100px] z-[2] w-24 text-center">
            put me in coach!
          </p>
          <img
            src="/step3-bubble.svg"
            alt="step 3 bubble"
            className="relative top-[30px] left-[60px]"
          />
        </div>

        <div className="w-4/5 overflow-hidden rounded-full bg-white mb-8">
          <img
            src="/toad-3-hero-dance.svg"
            className="p-4"
            alt="Toad hero dance"
          />
        </div>
      </div>

      <p className="text-center">
        WARNING! your NFT will be at risk until ETH repaid. More borrow = More
        risky
      </p>
    </div>
  );
}
