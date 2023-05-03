import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useGlobalStore } from "~/lib/globalStore";
import { LoanDetails, NFTs } from "./";
import { LoanDetailsForExistingLoan } from "./LoanDetailsForExistingLoan";
import { usePoolQuote } from "~/hooks/usePoolQuote";
import { usePaprController } from "~/hooks/usePaprController";
import { formatBigNum } from "~/lib/numberFormat";
import { useMatches } from "@remix-run/react";

export function HeaderBar() {
  const { isConnected } = useAccount();
  const routeMatches = useMatches();
  const pathname = useMemo(() => {
    return routeMatches[routeMatches.length - 1].pathname;
  }, [routeMatches]);

  const className = useMemo(() => {
    const justification = isConnected ? "justify-between" : "justify-center";
    return `flex items-center bg-light-grey text-black relative px-4 min-h-[50px] ${justification}`;
  }, [isConnected]);

  const selectedVault = useGlobalStore((s) => s.selectedVault);
  const inProgressLoan = useGlobalStore((s) => s.inProgressLoan);
  const hasSelectedNFTs = useMemo(
    () => inProgressLoan && inProgressLoan.tokenIds.length > 0,
    [inProgressLoan]
  );

  if (!inProgressLoan) {
    if (selectedVault) {
      return (
        <div className={className}>
          <LoanDetailsForExistingLoan vault={selectedVault} />
        </div>
      );
    }
    return <></>;
  }

  if (hasSelectedNFTs && !inProgressLoan.amount) {
    if (pathname === "/much") {
      return (
        <div className={className}>
          <div className="flex flex-row items-center w-full h-7 rounded-lg bg-medium-grey">
            <NFTs
              collectionAddress={inProgressLoan.collectionAddress}
              tokenIds={inProgressLoan.tokenIds}
            />
            <p className="ml-2">Set loan amount</p>
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        <NFTsSelected />
      </div>
    );
  }

  if (hasSelectedNFTs && inProgressLoan.amount) {
    return (
      <div className={className}>
        <LoanDetails
          collectionAddress={inProgressLoan.collectionAddress}
          tokenIds={inProgressLoan.tokenIds}
          riskLevel={inProgressLoan.riskLevel!} // amount and risk level get updated in lock step
          action="borrow"
          amount={inProgressLoan.amount}
        />
      </div>
    );
  }

  return <></>;
}

function NFTsSelected() {
  const { paprToken, underlying } = usePaprController();
  const inProgressLoan = useGlobalStore((s) => s.inProgressLoan);

  const maxLoanQuote = usePoolQuote({
    amount: inProgressLoan?.maxDebtForChosen || null,
    inputToken: paprToken.id,
    outputToken: underlying.id,
    tradeType: "exactIn",
    skip: !inProgressLoan?.maxDebtForChosen,
  });

  const formattedQuote = useMemo(() => {
    if (!maxLoanQuote) return "...";
    return `${formatBigNum(maxLoanQuote, underlying.decimals, 3)} ${
      underlying.symbol
    }`;
  }, [maxLoanQuote, underlying.decimals, underlying.symbol]);

  const pluralizedNumberNfts = useMemo(() => {
    if (!inProgressLoan) return "";
    if (inProgressLoan.tokenIds.length === 1) return "NFT";
    return "NFTs";
  }, [inProgressLoan]);

  if (!inProgressLoan) return <></>;

  return (
    <div className="flex items-center justify-between w-full h-7 rounded-lg bg-medium-grey">
      <div className="flex flex-row items-center">
        <NFTs
          collectionAddress={inProgressLoan.collectionAddress}
          tokenIds={inProgressLoan.tokenIds}
        />
        <p className="ml-2">
          {inProgressLoan.tokenIds.length} {pluralizedNumberNfts}
        </p>
      </div>
      <div className="mr-2">
        <p>Max Loan: {formattedQuote}</p>
      </div>
    </div>
  );
}
