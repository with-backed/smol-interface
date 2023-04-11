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
import { Link } from "@remix-run/react";

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
        className="absolute top-12 left-0 w-full bg-black text-white p-4 flex flex-col gap-2 items-center"
        {...disclosure}
      >
        <NewLoan />
        <Info />
        <Links />
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

function NewLoan() {
  return (
    <button
      className="bg-neutral-700 rounded-lg h-7 w-full"
      onClick={() => alert("This will eventually do somethhing")}
    >
      New Loan
    </button>
  );
}

function Info() {
  return (
    <span className="flex items-center gap-4">
      built by <img className="w-12" src="/bunn.png" alt="" aria-hidden />{" "}
      backed
    </span>
  );
}

function Links() {
  return (
    <ul className="flex gap-4 whitespace-nowrap flex-wrap items-center justify-center">
      <li>
        <Link to="https://papr.wtf/legal/privacy-policy.pdf">privacy</Link>
      </li>
      <li>
        <Link to="https://discord.gg/ZCxGuE6Ytk">discord</Link>
      </li>
      <li>
        <Link to="https://twitter.com/backed_xyz">twitter</Link>
      </li>
      <li>
        <Link to="https://www.papr.wtf">powered by papr.wtf</Link>
      </li>
    </ul>
  );
}
