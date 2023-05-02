import { ethers } from "ethers";
import { useMemo } from "react";
import { useQuery } from "urql";
import { graphql } from "~/gql";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import type {
  MostRecentLoanByVaultQuery,
  MostRecentRepaymentByVaultQuery,
} from "~/gql/graphql";
import { usePoolQuote } from "../usePoolQuote";
import { usePaprController } from "../usePaprController";
import { formatBigNum, formatPercent } from "~/lib/numberFormat";
import { calculateSwapFee } from "~/lib/fees";
import type { SubgraphVault } from "~/hooks/useVault";

dayjs.extend(duration);

const mostRecentLoanByVaultDocument = graphql(`
  query mostRecentLoanByVault($vaultId: String!) {
    activities(
      where: { and: [{ vault: $vaultId }, { amountBorrowed_not: null }] }
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      ...allActivityProperties
    }
  }
`);

const mostRecentRepaymentByVaultDocument = graphql(`
  query mostRecentRepaymentByVault($vaultId: String!) {
    activities(
      where: {
        and: [
          { vault: $vaultId }
          { amountRepaid_not: null }
          { amountIn_not: null }
        ]
      }
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      ...allActivityProperties
    }
  }
`);

export type LoanDetails = {
  borrowedPapr: ethers.BigNumber | null;
  borrowedUnderlying: ethers.BigNumber | null;
  vaultDebt: ethers.BigNumber; // different from borrowedPapr in the case of an auction
  formattedBorrowed: string;
  interest: ethers.BigNumber | null;
  formattedInterest: string;
  repaymentQuote: ethers.BigNumber | null;
  totalOwed: ethers.BigNumber | null;
  formattedTotalOwed: string;
  repaid: ethers.BigNumber | null;
  formattedRepaid: string;
  costPercentage: number | null;
  formattedCostPercentage: string;
  numDays: number | null;
  vaultNFTs: string[];
};

export function useLoan(vault: NonNullable<SubgraphVault>): LoanDetails {
  const { paprToken, underlying } = usePaprController();

  const vaultDebt = useMemo(() => {
    return ethers.BigNumber.from(vault.debt);
  }, [vault.debt]);

  const loanRepaid = useMemo(() => {
    return vaultDebt.isZero();
  }, [vaultDebt]);

  const [{ data: recentLoanData }] = useQuery<MostRecentLoanByVaultQuery>({
    query: mostRecentLoanByVaultDocument,
    variables: {
      vaultId: vault.id,
    },
  });

  const [{ data: recentRepaymentData }] =
    useQuery<MostRecentRepaymentByVaultQuery>({
      query: mostRecentRepaymentByVaultDocument,
      variables: {
        vaultId: vault.id,
      },
      pause: !loanRepaid,
    });

  const recentLoanActivity = useMemo(() => {
    if (!recentLoanData?.activities) return null;
    return recentLoanData.activities[0];
  }, [recentLoanData?.activities]);

  const recentRepaymentActivity = useMemo(() => {
    if (!recentRepaymentData?.activities) return null;
    return recentRepaymentData.activities[0];
  }, [recentRepaymentData?.activities]);

  const borrowedPapr = useMemo(() => {
    if (!recentLoanActivity) return null;
    return ethers.BigNumber.from(recentLoanActivity.amountBorrowed);
  }, [recentLoanActivity]);

  const borrowedFromSwap = useMemo(() => {
    if (!recentLoanActivity) return null;
    if (!recentLoanActivity.amountOut) return ethers.BigNumber.from(0);
    const amountOut = ethers.BigNumber.from(recentLoanActivity.amountOut);

    return amountOut.sub(calculateSwapFee(amountOut));
  }, [recentLoanActivity]);

  const formattedBorrowed = useMemo(() => {
    if (!borrowedFromSwap) return "...";
    return formatBigNum(borrowedFromSwap, underlying.decimals) + " WETH";
  }, [borrowedFromSwap, underlying.decimals]);

  const repaymentQuote = usePoolQuote({
    amount: vaultDebt,
    inputToken: underlying.id,
    outputToken: paprToken.id,
    tradeType: "exactOut",
    skip: !borrowedFromSwap || loanRepaid, // save RPC call and do not fetch quote if loan is repaid
  });

  const totalOwed = useMemo(() => {
    if (loanRepaid) return ethers.BigNumber.from(0);
    if (!repaymentQuote) return null;
    return repaymentQuote.add(calculateSwapFee(repaymentQuote));
  }, [repaymentQuote, loanRepaid]);

  const formattedTotalOwed = useMemo(() => {
    if (!totalOwed) return "...";
    return formatBigNum(totalOwed, underlying.decimals) + " WETH";
  }, [totalOwed, underlying.decimals]);

  const repaid = useMemo(() => {
    if (!loanRepaid || !recentRepaymentActivity) return null;
    const amountIn = ethers.BigNumber.from(recentRepaymentActivity.amountIn);
    return amountIn.add(calculateSwapFee(amountIn));
  }, [recentRepaymentActivity, loanRepaid]);

  const formattedRepaid = useMemo(() => {
    if (!repaid) return "...";
    return formatBigNum(repaid, underlying.decimals) + " WETH";
  }, [repaid, underlying.decimals]);

  const repaymentForInterest = useMemo(() => {
    return repaid || totalOwed;
  }, [repaid, totalOwed]);

  const interest = useMemo(() => {
    if (!borrowedFromSwap || !repaymentForInterest) return null;
    return repaymentForInterest.sub(borrowedFromSwap);
  }, [borrowedFromSwap, repaymentForInterest]);

  const formattedInterest = useMemo(() => {
    if (!interest) return "...";
    return formatBigNum(interest, underlying.decimals) + " WETH";
  }, [interest, underlying.decimals]);

  const loanDuration = useMemo(() => {
    if (loanRepaid) {
      if (!recentRepaymentActivity || !recentLoanActivity) return null;
      return recentRepaymentActivity.timestamp - recentLoanActivity.timestamp;
    }

    if (!recentLoanActivity) return null;
    return new Date().getTime() / 1000 - recentLoanActivity.timestamp;
  }, [recentLoanActivity, recentRepaymentActivity, loanRepaid]);

  const numDays = useMemo(() => {
    if (!loanDuration) return null;
    return Math.floor(
      dayjs
        .duration({
          seconds: loanDuration,
        })
        .asDays()
    );
  }, [loanDuration]);

  const costPercentage = useMemo(() => {
    if (!interest || !borrowedFromSwap) return null;
    const interestNum = parseFloat(formatBigNum(interest, underlying.decimals));
    const principalNum = parseFloat(
      formatBigNum(borrowedFromSwap, underlying.decimals)
    );
    return interestNum / principalNum;
  }, [interest, borrowedFromSwap, underlying.decimals]);

  const formattedCostPercentage = useMemo(() => {
    if (!costPercentage) return "...";
    return formatPercent(costPercentage);
  }, [costPercentage]);

  const vaultNFTs = useMemo(() => {
    return vault.collateral.map((c) => c.id);
  }, [vault.collateral]);

  return {
    borrowedPapr,
    borrowedUnderlying: borrowedFromSwap,
    vaultDebt,
    formattedBorrowed,
    interest,
    formattedInterest,
    repaymentQuote,
    totalOwed,
    formattedTotalOwed,
    repaid,
    formattedRepaid,
    costPercentage,
    formattedCostPercentage,
    numDays,
    vaultNFTs,
  };
}
