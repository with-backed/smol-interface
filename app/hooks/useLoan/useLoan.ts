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
import { formatBigNum } from "~/lib/numberFormat";
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
  interest: ethers.BigNumber | null;
  totalRepayment: ethers.BigNumber | null;
  costPercentage: number | null;
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

  const {
    "0": { data: vaultData },
  } = useQuery<VaultbyIdQuery>({
    query: VaultbyIdDocument,
    variables: {
      id: vaultId,
    },
  });
  const {
    "0": { data: recentLoanData },
  } = useQuery<MostRecentLoanByVaultQuery>({
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
    amount: borrowedFromSwap || undefined,
    inputToken: underlying,
    outputToken: paprToken,
    tradeType: "exactOut",
    skip: !borrowedFromSwap,
  });

  const totalRepayment = useMemo(() => {
    if (!totalRepaymentQuote.quote || !recentLoanActivity) return null;

    return totalRepaymentQuote.quote.add(
      calculateSwapFee(
        totalRepaymentQuote.quote,
        ethers.BigNumber.from(
          recentLoanActivity.clientFeeBips || DEFAULT_CLIENT_FEE_BIPS
        )
      )
    );
  }, [totalRepaymentQuote.quote, recentLoanActivity]);

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

  return {
    borrowed: borrowedFromSwap,
    interest,
    totalRepayment,
    numDays,
    costPercentage,
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
