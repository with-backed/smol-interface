import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet } from "~/components/Buttons/ConnectWallet";
import type { DisclosureStateReturn } from "reakit/Disclosure";
import { DisclosureContent, Disclosure } from "reakit/Disclosure";
import { Caret } from "~/components/Caret";
import { Link } from "@remix-run/react";
import { TextButton } from "../Buttons/TextButton";
import { useAccountNFTs } from "~/hooks/useAccountNFTs";
import { usePaprController } from "~/hooks/usePaprController";
import { Asset } from "@center-inc/react";
import { useHeaderDisclosureState } from "~/hooks/useHeaderDisclosureState";
import { useCurrentVaults } from "~/hooks/useCurrentVaults";
import { getAddress } from "ethers/lib/utils";
import { Button } from "reakit/Button";
import { useGlobalStore } from "~/lib/globalStore";
import { HeaderState } from "./HeaderState";
import { HeaderBar, ExistingLoans } from "./";
import { useMaxDebt } from "~/hooks/useMaxDebt";
import { OraclePriceType } from "~/lib/reservoir";
import { usePoolQuote } from "~/hooks/usePoolQuote";
import { formatBigNum } from "~/lib/numberFormat";
import type { ethers } from "ethers";
import { useNFTSymbol } from "~/hooks/useNFTSymbol";

export function Header() {
  const { address, isConnected } = useAccount();
  const disclosure = useHeaderDisclosureState(); // TODO: cnasc/adamgobes: this disclosure state is causing the entire header to re-render when opening/closing, which refetches quotes and is inefficient
  const state = useGlobalStore((s) => s.state);
  const setCurrentVaults = useGlobalStore((s) => s.setCurrentVaults);
  const setRefreshCurrentVaults = useGlobalStore(
    (s) => s.setRefreshCurrentVaults
  );

  const showHowMuchBorrow = useGlobalStore(
    (s) =>
      !!s.inProgressLoan?.collectionAddress &&
      s.inProgressLoan.tokenIds.length > 0
  );

  const { currentVaults, reexecuteQuery } = useCurrentVaults(address);
  const refreshVaults = useCallback(() => {
    reexecuteQuery({ requestPolicy: "cache-and-network" });
  }, [reexecuteQuery]);

  useEffect(() => {
    if (currentVaults) {
      setCurrentVaults(currentVaults);
      setRefreshCurrentVaults(refreshVaults);
    }
  }, [currentVaults, setCurrentVaults, refreshVaults, setRefreshCurrentVaults]);

  const className = useMemo(() => {
    const justification = isConnected ? "justify-between" : "justify-center";
    return `flex items-center bg-black text-white relative px-4 min-h-[50px] ${justification}`;
  }, [isConnected]);

  return (
    <header className="bg-black relative">
      <div className={className}>
        <ConnectWallet />
        {isConnected && <DropdownButton {...disclosure} />}
      </div>
      <HeaderBar />
      <DisclosureContent
        className={`absolute ${
          showHowMuchBorrow ? "top-24" : "top-12"
        } left-0 w-full bg-black text-white p-4 pt-0 flex flex-col gap-3 items-center z-10`}
        {...disclosure}
      >
        {(() => {
          switch (state) {
            case HeaderState.Default:
              return <DefaultConnectedHeaderContent />;
            case HeaderState.NoNFTs:
              return <NoEligibleNFTsHeaderContent />;
            case HeaderState.ListEligibleCollections:
              return <SelectCollectionHeaderContent />;
            case HeaderState.SelectNFTs:
              return <SelectNFTsHeaderContent />;
            default:
              const exhaustiveCheck: never = state; // eslint-disable-line no-case-declarations
              throw new Error(`Unhandled HeaderState case: ${exhaustiveCheck}`);
          }
        })()}
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
    <button className="bg-neutral-700 rounded-lg h-7 w-full">
      <Link to="/pick" className="no-underline">
        New Loan
      </Link>
    </button>
  );
}

function Info() {
  return (
    <span className="flex items-center gap-4 mt-4">
      built by <img className="w-12 pb-4" src="/bunn.png" alt="" aria-hidden />{" "}
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
      <ExistingLoans />
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
      <CancelButton />
    </>
  );
}

function SelectCollectionHeaderContent() {
  const { address } = useAccount();
  const { allowedCollateral } = usePaprController();
  const collateralContractAddresses = useMemo(
    () => allowedCollateral.map((c) => c.token.id),
    [allowedCollateral]
  );
  const currentVaults = useGlobalStore((s) => s.currentVaults);
  const setInProgressLoan = useGlobalStore((s) => s.setInProgressLoan);
  const setHeaderState = useGlobalStore((s) => s.setHeaderState);
  const { userCollectionNFTs, nftsLoading } = useAccountNFTs(
    address,
    collateralContractAddresses
  );

  const collateralAddressesForExistingVaults = useMemo(() => {
    return new Set(currentVaults?.map((v) => getAddress(v.token.id)));
  }, [currentVaults]);

  const uniqueCollections = useMemo(() => {
    const userCollectionCollateral = userCollectionNFTs.map((nft) =>
      getAddress(nft.address)
    );

    if (!currentVaults) return Array.from(new Set(userCollectionCollateral));

    const userAndVaultCollateral = currentVaults
      .map((v) => getAddress(v.token.id))
      .concat(userCollectionCollateral);

    return Array.from(new Set(userAndVaultCollateral));
  }, [userCollectionNFTs, currentVaults]);

  const handleClick = useCallback(
    (selectedCollectionAddress: string, maxDebt: ethers.BigNumber) => {
      setInProgressLoan((_prev) => {
        return {
          collectionAddress: selectedCollectionAddress,
          tokenIds: [],
          maxDebtForCollection: maxDebt,
          maxDebtForChosen: undefined,
          amount: undefined,
          riskLevel: undefined,
        };
      });
      setHeaderState(HeaderState.SelectNFTs);
    },
    [setHeaderState, setInProgressLoan]
  );

  return (
    <>
      <NewLoan />
      <p className="self-start">
        Select collection (max loan)
        <ul className="list-[square] pl-6">
          {uniqueCollections.map((c) => (
            <SelectCollectionLineItem
              key={c}
              collateralAddress={c}
              numCollateral={
                userCollectionNFTs.filter(
                  (nft) => getAddress(nft.address) === getAddress(c)
                ).length
              }
              collateralAddressesForExistingVaults={
                collateralAddressesForExistingVaults
              }
              handleClick={handleClick}
            />
          ))}
        </ul>
      </p>
      <CancelButton />
    </>
  );
}

type LineItemProps = {
  collateralAddressesForExistingVaults: Set<string>;
  collateralAddress: string;
  numCollateral: number;
  handleClick: (
    selectedCollectionAddress: string,
    maxDebt: ethers.BigNumber
  ) => void;
};

function SelectCollectionLineItem({
  collateralAddressesForExistingVaults,
  collateralAddress,
  numCollateral,
  handleClick,
}: LineItemProps) {
  const { underlying, paprToken } = usePaprController();
  const nftSymbol = useNFTSymbol(collateralAddress);

  const maxDebtInPaprPerCollateral = useMaxDebt(
    collateralAddress,
    OraclePriceType.lower
  );
  const maxDebtInPapr = useMemo(() => {
    if (!maxDebtInPaprPerCollateral) return null;
    return maxDebtInPaprPerCollateral.mul(numCollateral);
  }, [maxDebtInPaprPerCollateral, numCollateral]);

  const maxDebtInETH = usePoolQuote({
    amount: maxDebtInPapr,
    inputToken: paprToken.id,
    outputToken: underlying.id,
    tradeType: "exactIn",
    skip: !maxDebtInPapr,
  });

  return (
    <li>
      <TextButton
        disabled={
          collateralAddressesForExistingVaults.has(collateralAddress) ||
          !maxDebtInPapr
        }
        onClick={() => handleClick(collateralAddress, maxDebtInPapr!)}
      >
        <span
          className={
            collateralAddressesForExistingVaults.has(collateralAddress)
              ? "line-through"
              : ""
          }
        >
          {nftSymbol}
        </span>
      </TextButton>{" "}
      (
      {maxDebtInETH
        ? formatBigNum(maxDebtInETH, underlying.decimals, 3) +
          ` ${underlying.symbol}`
        : "..."}
      )
    </li>
  );
}

function SelectNFTsHeaderContent() {
  const { paprToken, underlying } = usePaprController();
  const selectedCollectionAddress = useGlobalStore(
    (s) => s.inProgressLoan?.collectionAddress
  );
  const maxDebtForCollection = useGlobalStore(
    (s) => s.inProgressLoan?.maxDebtForCollection
  );
  const maxDebtForChosen = useGlobalStore(
    (s) => s.inProgressLoan?.maxDebtForChosen || null
  );
  const maxDebtChosenInETH = usePoolQuote({
    amount: maxDebtForChosen,
    inputToken: paprToken.id,
    outputToken: underlying.id,
    tradeType: "exactIn",
    skip: !maxDebtForChosen,
  });

  const formattedMaxDebt = useMemo(() => {
    if (!maxDebtChosenInETH) return "...";
    return `${formatBigNum(maxDebtChosenInETH, underlying.decimals, 3)} ${
      underlying.symbol
    }`;
  }, [maxDebtChosenInETH, underlying.decimals, underlying.symbol]);

  const setInProgressLoan = useGlobalStore((s) => s.setInProgressLoan);
  const { address } = useAccount();
  const { userCollectionNFTs, nftsLoading } = useAccountNFTs(address, [
    // it should not be possible to get here without a selected collection.
    // we'll want to look into enforcing that invariant. We can have `setHeaderState`
    // check that the state conforms to our expectations before advancing.
    selectedCollectionAddress || "",
  ]);
  const [selectedTokenIds, setSelectedTokenIds] = useState<{
    [tokenId: string]: boolean;
  }>({});

  const handleNFTClick = useCallback((tokenId: string) => {
    setSelectedTokenIds((prev) => ({
      ...prev,
      [tokenId]: !prev[tokenId],
    }));
  }, []);
  useEffect(() => {
    const tokenIds = Object.entries(selectedTokenIds).reduce(
      (acc, [id, include]) => (include ? [...acc, id] : acc),
      [] as string[]
    );
    if (!maxDebtForCollection || tokenIds.length === 0) return;

    setInProgressLoan((prev) => {
      if (prev) {
        return {
          ...prev,
          amount: undefined,
          maxDebtForChosen: maxDebtForCollection
            .mul(tokenIds.length)
            .div(userCollectionNFTs.length),
        };
      }
      return null;
    });
  }, [
    maxDebtForCollection,
    selectedTokenIds,
    setInProgressLoan,
    userCollectionNFTs.length,
  ]);

  const { toggle } = useHeaderDisclosureState();

  const handleDoneClick = useCallback(() => {
    // TODO: should probably disable this until at least one NFT is selected
    const tokenIds = Object.entries(selectedTokenIds).reduce(
      (acc, [id, include]) => (include ? [...acc, id] : acc),
      [] as string[]
    );
    setInProgressLoan((prev) => {
      if (prev) {
        return {
          ...prev,
          tokenIds: [...prev.tokenIds, ...tokenIds],
        };
      }
      return null;
    });
    toggle();
  }, [selectedTokenIds, setInProgressLoan, toggle]);

  return (
    <>
      <NewLoan />
      <p>Select items (Max: {formattedMaxDebt})</p>
      <div className="flex flex-wrap gap-2">
        {userCollectionNFTs.map(({ address, tokenId }, i) => (
          <Button
            key={address + tokenId}
            onClick={() => handleNFTClick(tokenId)}
            as="div"
          >
            <NFT
              address={address}
              tokenId={tokenId}
              selected={!!selectedTokenIds[tokenId]}
            />
          </Button>
        ))}
      </div>
      <TextButton onClick={handleDoneClick}>Done</TextButton>
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

function CancelButton() {
  const clear = useGlobalStore((s) => s.clear);
  return <TextButton onClick={clear}>cancel</TextButton>;
}
