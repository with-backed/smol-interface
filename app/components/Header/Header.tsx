import { useMemo } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet } from "~/components/Buttons/ConnectWallet";
import type { DisclosureStateReturn } from "reakit/Disclosure";
import {
  useDisclosureState,
  DisclosureContent,
  Disclosure,
} from "reakit/Disclosure";
import { Caret } from "~/components/Caret";

export function Header() {
  const { isConnected } = useAccount();
  const disclosure = useDisclosureState();

  const className = useMemo(() => {
    const justification = isConnected ? "between" : "center";
    return `flex items-center bg-black text-white relative px-4 h-12 justify-${justification}`;
  }, [isConnected]);

  return (
    <header className="bg-black relative">
      <div className={className}>
        <ConnectWallet />
        {isConnected && <DropdownButton {...disclosure} />}
      </div>
      <DisclosureContent
        className="absolute top-12 left-0 w-full bg-black text-white"
        {...disclosure}
      >
        y halo thar
      </DisclosureContent>
    </header>
  );
}

type DropdownButtonProps = DisclosureStateReturn;

function DropdownButton({ visible, ...props }: DropdownButtonProps) {
  return (
    <Disclosure visible={visible} {...props}>
      <Caret orientation={visible ? "up" : "down"} />
    </Disclosure>
  );
}
