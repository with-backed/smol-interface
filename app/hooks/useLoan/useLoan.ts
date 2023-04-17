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
      where: { and: [{ vault: $vaultId }, { amountRepaid_not: null }] }
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      ...allActivityProperties
    }
  }
`);

type Loan = {
  borrowedPapr: ethers.BigNumber | null;
  borrowedUnderlying: ethers.BigNumber | null;
  formattedBorrowed: string;
  interest: ethers.BigNumber | null;
  formattedInterest: string;
  repaymentQuote: ethers.BigNumber | null;
  totalRepayment: ethers.BigNumber | null;
  formattedTotalRepayment: string;
  costPercentage: number | null;
  formattedCostPercentage: string;
  numDays: number | null;
  vaultNFTs: string[];
};

export function useLoan(vault: NonNullable<SubgraphVault>): Loan {
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

  const borrowedFromSwap = useMemo(() => {
    if (!recentLoanActivity) return null;
    if (!recentLoanActivity.amountOut) return ethers.BigNumber.from(0);
    const amountOut = ethers.BigNumber.from(recentLoanActivity.amountOut);

    return amountOut.sub(calculateSwapFee(amountOut));
  }, [recentLoanActivity]);

  const totalRepaymentQuote = usePoolQuote({
    amount: vaultDebt,
    inputToken: underlying.id,
    outputToken: paprToken.id,
    tradeType: "exactOut",
    skip: !borrowedFromSwap || loanRepaid, // save RPC call and do not fetch quote if loan is repaid
  });

  const totalRepayment = useMemo(() => {
    if (loanRepaid) {
      if (!recentRepaymentActivity) return null;
      const amountIn = ethers.BigNumber.from(recentRepaymentActivity.amountIn);
      return amountIn.add(calculateSwapFee(amountIn));
    }

    if (!totalRepaymentQuote || !recentLoanActivity) return null;
    return totalRepaymentQuote.add(calculateSwapFee(totalRepaymentQuote));
  }, [
    totalRepaymentQuote,
    recentLoanActivity,
    loanRepaid,
    recentRepaymentActivity,
  ]);

  const interest = useMemo(() => {
    if (!borrowedFromSwap || !totalRepayment) return null;
    return totalRepayment.sub(borrowedFromSwap);
  }, [borrowedFromSwap, totalRepayment]);

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

  const formattedBorrowed = useMemo(() => {
    if (!borrowedFromSwap) return "...";
    return formatBigNum(borrowedFromSwap, underlying.decimals) + " WETH";
  }, [borrowedFromSwap, underlying.decimals]);

  const formattedInterest = useMemo(() => {
    if (!interest) return "...";
    return formatBigNum(interest, underlying.decimals) + " WETH";
  }, [interest, underlying.decimals]);

  const formattedTotalRepayment = useMemo(() => {
    if (!totalRepayment) return "...";
    return formatBigNum(totalRepayment, underlying.decimals) + " WETH";
  }, [totalRepayment, underlying.decimals]);

  const formattedCostPercentage = useMemo(() => {
    if (!costPercentage) return "...";
    return formatPercent(costPercentage);
  }, [costPercentage]);

  const vaultNFTs = useMemo(() => {
    return vault.collateral.map((c) => c.id);
  }, [vault.collateral]);

  return {
    borrowedPapr: vaultDebt,
    borrowedUnderlying: borrowedFromSwap,
    formattedBorrowed,
    interest,
    formattedInterest,
    repaymentQuote: totalRepaymentQuote,
    totalRepayment,
    formattedTotalRepayment,
    costPercentage,
    formattedCostPercentage,
    numDays,
    vaultNFTs,
  };
}
