import { useLocation } from "@remix-run/react";
import { useCallback, useEffect, useMemo } from "react";
import { Button } from "~/components/Buttons/Button";
import { HeaderState } from "~/components/Header";
import { useHeaderDisclosureState } from "~/hooks/useHeaderDisclosureState";
import { useExplainerStore } from "~/lib/explainerStore";
import { useGlobalStore } from "~/lib/globalStore";

export default function Hero() {
  const location = useLocation();
  const inProgressLoan = useGlobalStore((s) => s.inProgressLoan);
  const selectedVault = useGlobalStore((s) => s.selectedVault);
  const clear = useGlobalStore((s) => s.clear);
  const { setVisible } = useHeaderDisclosureState();
  const { setHeaderState } = useGlobalStore();
  const setActiveExplainer = useExplainerStore((s) => s.setActiveExplainer);

  useEffect(() => {
    if (location.state?.startCreate) {
      setVisible(true);
      clear();
      setHeaderState(HeaderState.ListEligibleCollections);
    }
  }, [location.state, setVisible, clear, setHeaderState]);

  const handleClick = useCallback(() => {
    if (inProgressLoan) {
      setVisible(true);
    } else {
      clear();
      setHeaderState(HeaderState.ListEligibleCollections);
      setVisible(true);
    }
  }, [inProgressLoan, clear, setHeaderState, setVisible]);

  const buttonText = useMemo(() => {
    if (selectedVault) return "create loan";
    return "pick ur hero";
  }, [selectedVault]);

  return (
    <div className="flex flex-col items-center p-4 gap-4 justify-evenly h-full grow graph-papr">
      <div className="flex w-full gap-2">
        <Button onClick={handleClick}>{buttonText}</Button>
        <Button
          onClick={() => setActiveExplainer("what-is")}
          theme="bg-unclickable-grey"
        >
          what hero?
        </Button>
      </div>
      <img
        src="3-hero-super-dance.svg"
        className="scalable"
        alt="Toad says: Put me in coach!"
      />

      <p className="text-center">
        WARNING! your NFT will be at risk until ETH repaid. More borrow = More
        risky
      </p>
    </div>
  );
}
