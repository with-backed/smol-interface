import { useLocation, useParams } from "@remix-run/react";
import { useCallback, useEffect, useMemo } from "react";
import { Button } from "~/components/Buttons/Button";
import { HeaderState } from "~/components/Header";
import { useHeaderDisclosureState } from "~/hooks/useHeaderDisclosureState";
import { useGlobalStore } from "~/lib/globalStore";

export default function Intro() {
  const location = useLocation();
  const selectedVault = useGlobalStore((s) => s.selectedVault);
  const clear = useGlobalStore((s) => s.clear);
  const { setVisible } = useHeaderDisclosureState();
  const { setHeaderState } = useGlobalStore();

  useEffect(() => {
    if (location.state?.startCreate) {
      setVisible(true);
      clear();
      setHeaderState(HeaderState.ListEligibleCollections);
    }
  }, [location.state, setVisible, clear, setHeaderState]);

  const handleClick = useCallback(() => {
    clear();
    setHeaderState(HeaderState.ListEligibleCollections);
    setVisible(true);
  }, [clear, setHeaderState, setVisible]);

  const buttonText = useMemo(() => {
    if (selectedVault) return "create new loan";
    return "pick ur hero";
  }, [selectedVault]);

  return (
    <div className="flex flex-col items-center p-4 gap-4 justify-center h-full grow graph-papr">
      <Button onClick={handleClick}>{buttonText}</Button>

      <img src="3-hero-super-dance.svg" alt="Toad says: Put me in coach!" />

      <p className="text-center">
        WARNING! your NFT will be at risk until ETH repaid. More borrow = More
        risky
      </p>
    </div>
  );
}
