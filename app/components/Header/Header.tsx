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
import { TextButton } from "../Buttons/TextButton";
import { useAccountNFTs } from "~/hooks/useAccountNFTs";
import { usePaprController } from "~/hooks/usePaprController";
import { Asset } from "@center-inc/react";

export function Header() {
  const { address, isConnected } = useAccount();
  const disclosure = useDisclosureState();
  const { allowedCollateral } = usePaprController();
  const collateralContractAddresses = useMemo(
    () => allowedCollateral.map((c) => c.token.id),
    [allowedCollateral]
  );
  const { userCollectionNFTs, nftsLoading } = useAccountNFTs(
    address,
    collateralContractAddresses
  );

  const className = useMemo(() => {
    const justification = isConnected ? "justify-between" : "justify-center";
    return `flex items-center bg-black text-white relative px-4 h-12 ${justification}`;
  }, [isConnected]);

  return (
    <header className="bg-black relative">
      <div className={className}>
        <ConnectWallet />
        {isConnected && <DropdownButton {...disclosure} />}
      </div>
      <DisclosureContent
        className="absolute top-12 left-0 w-full bg-black text-white p-4 pt-0 flex flex-col gap-3 items-center"
        {...disclosure}
      >
        <SelectNFTsHeaderContent />
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

function DefaultConnectedHeaderContent() {
  return (
    <>
      <NewLoan />
      <Info />
      <Links />
    </>
  );
}

function NoEligibleNFTsHeaderContent() {
  const { allowedCollateral } = usePaprController();
  return (
    <>
      <NewLoan />
      <p>
        No eligible NFTs! come back with 1 of these{" "}
        <Link to="https://github.com/with-backed/paprMEME-info">
          {allowedCollateral.length} collections
        </Link>
      </p>
      <TextButton>Cancel</TextButton>
    </>
  );
}

function SelectCollectionHeaderContent() {
  return (
    <>
      <NewLoan />
      <p className="self-start">
        Select collection (max loan)
        <ul className="list-[square] pl-6">
          <li>
            <TextButton>mfers</TextButton> (3.23 ETH)
          </li>
          <li>
            <TextButton>tubby cats</TextButton> (0.98 ETH)
          </li>
          <li>
            <TextButton>LOOT</TextButton> (0.77 ETH)
          </li>
        </ul>
      </p>
      <TextButton>Cancel</TextButton>
    </>
  );
}

function SelectNFTsHeaderContent() {
  const { address } = useAccount();
  const { allowedCollateral } = usePaprController();
  const collateralContractAddresses = useMemo(
    () => allowedCollateral.map((c) => c.token.id),
    [allowedCollateral]
  );
  const { userCollectionNFTs, nftsLoading } = useAccountNFTs(address, [
    collateralContractAddresses[0],
  ]);
  return (
    <>
      <NewLoan />
      <p>Select items (Max Loan: 3.23 ETH)</p>
      <div className="flex flex-wrap gap-2">
        {userCollectionNFTs.map(({ address, tokenId }, i) => (
          <NFT
            key={address + tokenId}
            address={address}
            tokenId={tokenId}
            selected={i % 2 === 0}
          />
        ))}
      </div>
      <TextButton>Done</TextButton>
    </>
  );
}

type NFTProps = {
  address: string;
  tokenId: string;
  selected?: boolean;
};

function NFT({ address, selected, tokenId }: NFTProps) {
  const wrapperClassName = useMemo(() => {
    const base =
      "flex relative justify-center items-center h-[76px] w-[76px] p-2";
    if (selected) {
      return `${base} border border-solid border-white rounded`;
    }
    return base;
  }, [selected]);
  return (
    <div className={wrapperClassName}>
      <Asset address={address} tokenId={tokenId} preset="small" />
      <Checkmark visible={selected} />
    </div>
  );
}

type CheckmarkProps = {
  visible?: boolean;
};
const Checkmark = ({ visible }: CheckmarkProps) => {
  const className = useMemo(
    () => (visible ? "absolute top-1 left-1" : "hidden"),
    [visible]
  );
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={17}
      height={17}
      fill="none"
      className={className}
    >
      <circle cx={8.5} cy={8.5} r={8.5} fill="#2D81FF" />
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="m5 9 3 3.5L12 5"
      />
    </svg>
  );
};
