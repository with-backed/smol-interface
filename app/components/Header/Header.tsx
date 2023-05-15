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
import { useHeaderDisclosureState } from "~/hooks/useHeaderDisclosureState";
import { useCurrentVaults } from "~/hooks/useCurrentVaults";
import { getAddress } from "ethers/lib/utils";
import { Button } from "reakit/Button";
import { useGlobalStore } from "~/lib/globalStore";
import { HeaderState } from "./HeaderState";
import { ExistingLoans } from "./";
import { useMaxDebt } from "~/hooks/useMaxDebt";
import { OraclePriceType } from "~/lib/reservoir";
import { usePoolQuote } from "~/hooks/usePoolQuote";
import { formatBigNum } from "~/lib/numberFormat";
import type { ethers } from "ethers";
import { useNFTSymbol } from "~/hooks/useNFTSymbol";
import { PAGES } from "../Footer/Footer";
import { useExplainerStore } from "~/lib/explainerStore";
import { CenterAsset } from "../CenterAsset";

export function Header() {
  const disclosure = useHeaderDisclosureState();
  const { address, isConnected } = useAccount({
    onDisconnect: () => {
      disclosure.setVisible(false);
    },
  });

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
    return `flex items-center bg-light-grey text-black relative px-4 min-h-[50px] ${justification}`;
  }, [isConnected]);

  return (
    <header className="bg-black relative">
      <div className={className}>
        <ConnectWallet />
        {isConnected && <DropdownButton {...disclosure} />}
      </div>
      <DisclosureContent
        className={`absolute ${
          showHowMuchBorrow ? "top-24" : "top-12"
        } left-0 w-full bg-light-grey text-black p-4 pt-0 flex flex-col gap-3 items-center z-10`}
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
  const { isConnected } = useAccount();
  return (
    <>
      <button className="bg-medium-grey rounded-lg h-7 w-full text-black">
        <Link
          to={PAGES[2]}
          state={{ startCreate: true }}
          className="no-underline text-black"
        >
          Create new Loan
        </Link>
      </button>
      {!isConnected && (
        <div className="my-1">
          <p>You must connect a wallet</p>
        </div>
      )}
    </>
  );
}

function Info() {
  return (
    <span className="flex items-center gap-4 mt-4">
      built by <img className="w-12 pb-4" src="/bunn.svg" alt="" aria-hidden />{" "}
      backed
    </span>
  );
}

function Links() {
  return (
    <ul className="flex gap-4 whitespace-nowrap flex-wrap items-center justify-center">
      <li>
        <Link
          to="https://papr.wtf/legal/privacy-policy.pdf"
          className="text-link-text"
        >
          privacy
        </Link>
      </li>
      <li>
        <Link to="https://discord.gg/ZCxGuE6Ytk" className="text-link-text">
          discord
        </Link>
      </li>
      <li>
        <Link to="https://twitter.com/backed_xyz" className="text-link-text">
          twitter
        </Link>
      </li>
      <li>
        <Link to="https://www.papr.wtf" className="text-link-text">
          powered by papr.wtf
        </Link>
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
  const { address, isConnected } = useAccount();
  const { allowedCollateral } = usePaprController();
  const collateralContractAddresses = useMemo(
    () => allowedCollateral.map((c) => c.token.id),
    [allowedCollateral]
  );
  const currentVaults = useGlobalStore((s) => s.currentVaults);
  const setInProgressLoan = useGlobalStore((s) => s.setInProgressLoan);
  const setHeaderState = useGlobalStore((s) => s.setHeaderState);
  const setActiveExplainer = useExplainerStore((s) => s.setActiveExplainer);

  const userNFTs = useGlobalStore((s) => s.userNFTs);
  const setUserNFTs = useGlobalStore((s) => s.setUserNFTs);
  const { nftsFromCenter } = useAccountNFTs(
    address,
    collateralContractAddresses
  );
  useEffect(() => {
    setUserNFTs(nftsFromCenter);
  }, [nftsFromCenter, setUserNFTs]);

  const collateralAddressesForExistingVaults = useMemo(() => {
    return new Set(currentVaults?.map((v) => getAddress(v.token.id)));
  }, [currentVaults]);

  const uniqueCollections = useMemo(() => {
    if (!userNFTs) return [];

    const userCollectionCollateral = userNFTs.map((nft) =>
      getAddress(nft.address)
    );

    if (!currentVaults) return Array.from(new Set(userCollectionCollateral));

    const userAndVaultCollateral = currentVaults
      .map((v) => getAddress(v.token.id))
      .concat(userCollectionCollateral);

    return Array.from(new Set(userAndVaultCollateral));
  }, [userNFTs, currentVaults]);

  const handleClick = useCallback(
    (selectedCollectionAddress: string, maxDebtPapr: ethers.BigNumber) => {
      setInProgressLoan((_prev) => {
        return {
          collectionAddress: selectedCollectionAddress,
          tokenIds: [],
          maxDebtForCollectionPapr: maxDebtPapr,
          maxDebtForChosenPapr: maxDebtPapr,
          amount: undefined,
          riskLevel: undefined,
        };
      });
      setHeaderState(HeaderState.SelectNFTs);
    },
    [setHeaderState, setInProgressLoan]
  );

  if (!isConnected) {
    return (
      <>
        <div className="my-1">
          <p>You must connect a wallet</p>
        </div>
        <CancelButton />
      </>
    );
  }

  if (!userNFTs)
    return (
      <>
        {/* This is a loading state, we may want to indicate that. */}
        <p className="self-start">Select collection (max loan)</p>
      </>
    );

  return (
    <>
      {isConnected && uniqueCollections.length > 0 && (
        <>
          <p className="self-start">Select collection (max loan)</p>
          {userNFTs && (
            <ul className="list-[square] pl-6 self-start">
              {uniqueCollections.map((c) => (
                <SelectCollectionLineItem
                  key={c}
                  collateralAddress={c}
                  numCollateral={
                    userNFTs.filter(
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
          )}

          <CancelButton />
        </>
      )}
      {isConnected && uniqueCollections.length === 0 && (
        <>
          <p className="self-start">
            This wallet does not hold any NFTs from{" "}
            <TextButton onClick={() => setActiveExplainer("what-is")}>
              eligible collections
            </TextButton>
            .
          </p>
          <CancelButton />
        </>
      )}
    </>
  );
}

type LineItemProps = {
  collateralAddressesForExistingVaults: Set<string>;
  collateralAddress: string;
  numCollateral: number;
  handleClick: (
    selectedCollectionAddress: string,
    maxDebtPapr: ethers.BigNumber
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
    <li className="flex flex-row justify-between">
      <TextButton
        disabled={
          collateralAddressesForExistingVaults.has(collateralAddress) ||
          !maxDebtInPapr ||
          !maxDebtInETH
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
  const { underlying, paprToken } = usePaprController();
  const selectedCollectionAddress = useGlobalStore(
    (s) => s.inProgressLoan?.collectionAddress
  );
  const setInProgressLoan = useGlobalStore((s) => s.setInProgressLoan);
  const [selectedTokenIds, setSelectedTokenIds] = useState<{
    [tokenId: string]: boolean;
  }>({});
  const maxDebtForCollectionPapr = useGlobalStore(
    (s) => s.inProgressLoan?.maxDebtForCollectionPapr
  );

  const userNFTs = useGlobalStore((s) => s.userNFTs);
  const nftsForCollection = useMemo(() => {
    if (!selectedCollectionAddress || !userNFTs) return [];
    return userNFTs.filter(
      (nft) => getAddress(nft.address) === getAddress(selectedCollectionAddress)
    );
  }, [selectedCollectionAddress, userNFTs]);

  const localMaxForChosen = useMemo(() => {
    const tokenIds = Object.entries(selectedTokenIds).reduce(
      (acc, [id, include]) => (include ? [...acc, id] : acc),
      [] as string[]
    );
    if (!maxDebtForCollectionPapr || tokenIds.length === 0) return null;
    return maxDebtForCollectionPapr
      .mul(tokenIds.length)
      .div(nftsForCollection.length);
  }, [maxDebtForCollectionPapr, nftsForCollection.length, selectedTokenIds]);
  const localMaxForChosenInEth = usePoolQuote({
    amount: localMaxForChosen,
    inputToken: paprToken.id,
    outputToken: underlying.id,
    tradeType: "exactIn",
    skip: !localMaxForChosen,
  });

  const formattedMaxDebt = useMemo(() => {
    if (!localMaxForChosenInEth) return "...";
    return `${formatBigNum(localMaxForChosenInEth, underlying.decimals, 3)} ${
      underlying.symbol
    }`;
  }, [localMaxForChosenInEth, underlying.decimals, underlying.symbol]);

  useEffect(() => {
    if (nftsForCollection.length > 0) {
      setSelectedTokenIds(
        nftsForCollection.reduce(
          (acc, nft) => ({ ...acc, [nft.tokenId]: true }),
          {} as { [tokenId: string]: boolean }
        )
      );
    }
  }, [nftsForCollection]);

  const handleNFTClick = useCallback((tokenId: string) => {
    setSelectedTokenIds((prev) => ({
      ...prev,
      [tokenId]: !prev[tokenId],
    }));
  }, []);

  const { toggle } = useHeaderDisclosureState();

  const handleDoneClick = useCallback(() => {
    // TODO: should probably disable this until at least one NFT is selected
    const tokenIds = Object.entries(selectedTokenIds).reduce(
      (acc, [id, include]) => (include ? [...acc, id] : acc),
      [] as string[]
    );
    if (!maxDebtForCollectionPapr || tokenIds.length === 0) return;
    setInProgressLoan((prev) => {
      if (prev) {
        return {
          ...prev,
          tokenIds: [...new Set(tokenIds)],
          amount: undefined,
          maxDebtForChosenPapr: maxDebtForCollectionPapr
            .mul(tokenIds.length)
            .div(nftsForCollection.length),
        };
      }
      return null;
    });
    toggle();
  }, [
    selectedTokenIds,
    maxDebtForCollectionPapr,
    setInProgressLoan,
    toggle,
    nftsForCollection.length,
  ]);

  return (
    <>
      <p>Select items (Max: {formattedMaxDebt})</p>
      <div className="flex flex-wrap gap-2">
        {nftsForCollection.map(({ address, tokenId }, i) => (
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
      <div className="w-2/5 flex flex-row justify-between items-center">
        <CancelButton />
        <TextButton onClick={handleDoneClick}>Done</TextButton>
      </div>
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
      <CenterAsset address={address} tokenId={tokenId} preset="small" />
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
  const { isConnected } = useAccount();
  const { toggle } = useHeaderDisclosureState();
  const clear = useGlobalStore((s) => s.clear);
  const handleClick = useCallback(() => {
    if (isConnected) {
      clear();
      toggle();
    } else {
      clear();
      toggle();
    }
  }, [isConnected, toggle, clear]);
  return <TextButton onClick={handleClick}>Cancel</TextButton>;
}
