import { ethers } from "ethers";
import { useMemo } from "react";
import { useQuery } from "urql";
import { graphql } from "~/gql";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import {
  MostRecentLoanByVaultDocument,
  MostRecentLoanByVaultQuery,
  VaultbyIdDocument,
  VaultbyIdQuery,
} from "~/gql/graphql";
import { usePoolQuote } from "../usePoolQuote";
import { usePaprController } from "../usePaprController";
import { formatBigNum, formatPercent } from "~/lib/numberFormat";
import { DEFAULT_CLIENT_FEE_BIPS } from "~/lib/constants";

dayjs.extend(duration);

const vaultByIdQuery = graphql(`
  query vaultbyId($id: ID!) {
    vault(id: $id) {
      ...allVaultProperties
    }
  }
`);

const mostRecentLoanByVaultQuery = graphql(`
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

type LoanDetails = {
  borrowed: ethers.BigNumber | null;
  formattedBorrowed: string;
  interest: ethers.BigNumber | null;
  formattedInterest: string;
  totalRepayment: ethers.BigNumber | null;
  formattedTotalRepayment: string;
  costPercentage: number | null;
  formattedCostPercentage: string;
  numDays: number | null;
};

const address = "0x82c1b61da09b5fdce098a212bb8070210ab91049";

export function useLoan(
  controllerId: string,
  collateralAddress: string
): LoanDetails {
  const { paprToken, underlying } = usePaprController();

  const vaultId = useMemo(() => {
    return generateVaultId(controllerId, collateralAddress, address);
  }, [controllerId, collateralAddress]);

  const [{ data: vaultData }] = useQuery<VaultbyIdQuery>({
    query: VaultbyIdDocument,
    variables: {
      id: vaultId,
    },
  });
  const [{ data: recentLoanData }] = useQuery<MostRecentLoanByVaultQuery>({
    query: MostRecentLoanByVaultDocument,
    variables: {
      vaultId: vaultId,
    },
  });

  const recentLoanActivity = useMemo(() => {
    if (!recentLoanData?.activities) return null;
    return recentLoanData.activities[0];
  }, [recentLoanData?.activities]);

  const vaultDebt = useMemo(() => {
    if (!vaultData?.vault) return null;
    return ethers.BigNumber.from(vaultData.vault.debt);
  }, [vaultData?.vault]);

  const borrowedFromSwap = useMemo(() => {
    if (!recentLoanActivity) return null;
    if (!recentLoanActivity.amountOut) return ethers.BigNumber.from(0);
    const amountOut = ethers.BigNumber.from(recentLoanActivity.amountOut);

    return amountOut.sub(
      calculateSwapFee(
        amountOut,
        ethers.BigNumber.from(
          recentLoanActivity.clientFeeBips || DEFAULT_CLIENT_FEE_BIPS
        )
      )
    );
  }, [recentLoanActivity]);

  const totalRepaymentQuote = usePoolQuote({
    amount: borrowedFromSwap,
    inputToken: underlying.id,
    outputToken: paprToken.id,
    tradeType: "exactOut",
    skip: !borrowedFromSwap,
  });

  const totalRepayment = useMemo(() => {
    if (!totalRepaymentQuote || !recentLoanActivity) return null;

    return totalRepaymentQuote.add(
      calculateSwapFee(
        totalRepaymentQuote,
        ethers.BigNumber.from(
          recentLoanActivity.clientFeeBips || DEFAULT_CLIENT_FEE_BIPS
        )
      )
    );
  }, [totalRepaymentQuote, recentLoanActivity]);

  const interest = useMemo(() => {
    if (!borrowedFromSwap || !totalRepayment) return null;
    return totalRepayment.sub(borrowedFromSwap);
  }, [borrowedFromSwap, totalRepayment]);

  const loanDuration = useMemo(() => {
    if (!recentLoanActivity) return null;
    return new Date().getTime() / 1000 - recentLoanActivity.timestamp;
  }, [recentLoanActivity]);

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
    if (!interest || !borrowedFromSwap || !loanDuration) return null;
    const interestNum = parseFloat(formatBigNum(interest, underlying.decimals));
    const principalNum = parseFloat(
      formatBigNum(borrowedFromSwap, underlying.decimals)
    );
    return interestNum / principalNum;
  }, [interest, borrowedFromSwap, loanDuration, underlying.decimals]);

  const formattedBorrowed = useMemo(() => {
    if (!borrowedFromSwap) return "...";
    return formatBigNum(borrowedFromSwap, underlying.decimals) + " ETH";
  }, [borrowedFromSwap, underlying.decimals]);

  const formattedInterest = useMemo(() => {
    if (!interest) return "...";
    return formatBigNum(interest, underlying.decimals) + " ETH";
  }, [interest, underlying.decimals]);

  const formattedTotalRepayment = useMemo(() => {
    if (!totalRepayment) return "...";
    return formatBigNum(totalRepayment, underlying.decimals) + " ETH";
  }, [totalRepayment, underlying.decimals]);

  const formattedCostPercentage = useMemo(() => {
    if (!costPercentage) return "...";
    return formatPercent(costPercentage);
  }, [costPercentage]);

  return {
    borrowed: borrowedFromSwap,
    formattedBorrowed,
    interest,
    formattedInterest,
    totalRepayment,
    formattedTotalRepayment,
    costPercentage,
    formattedCostPercentage,
    numDays,
  };
}

function calculateSwapFee(
  base: ethers.BigNumber,
  swapFeeBips: ethers.BigNumber
) {
  return base.mul(swapFeeBips).div(10000);
}

function generateVaultId(
  controllerId: string,
  collateralAddress: string,
  account: string
) {
  return `${controllerId.toLowerCase()}-${account.toLowerCase()}-${collateralAddress.toLowerCase()}`;
}
