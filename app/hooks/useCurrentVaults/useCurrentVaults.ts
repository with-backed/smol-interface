import { usePaprController } from "~/hooks/usePaprController";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "urql";
import { graphql } from "~/gql";
import type { VaultsByOwnerForControllerQuery } from "~/gql/graphql";
import { ethers } from "ethers";
import { erc20ABI, useAccount, useContractRead } from "wagmi";
import type { VaultWithRiskLevel } from "~/lib/globalStore";
import { useTarget } from "../useTarget";
import { useOracleInfo } from "../useOracleInfo";
import { OraclePriceType } from "~/lib/reservoir";
import { calculateMaxDebt } from "../useMaxDebt/useMaxDebt";
import { riskLevelFromDebts } from "~/lib/utils";
import type { RiskLevel } from "~/lib/globalStore";

const vaultsDocument = graphql(`
  query vaultsByOwnerForController($owner: Bytes, $controller: String) {
    vaults(where: { account: $owner, controller: $controller }) {
      ...allVaultProperties
    }
  }
`);

export function useCurrentVaults(user: string | undefined) {
  const { id, paprToken, underlying, maxLTV } = usePaprController();
  const { address } = useAccount();

  const [vaultsWithRiskLevel, setVaultsWithRiskLevel] = useState<
    VaultWithRiskLevel[] | undefined
  >(undefined);
  const [prevData, setPrevData] = useState<
    VaultsByOwnerForControllerQuery | undefined
  >(undefined);

  const [{ data: vaultsData, fetching: vaultsFetching }, reexecuteQuery] =
    useQuery({
      query: vaultsDocument,
      variables: {
        owner: user?.toLowerCase(),
        controller: id.toLowerCase(),
      },
      pause: !user,
    });

  const { data: paprBalance } = useContractRead({
    address: paprToken.id as `0x${string}`,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });
  const targetResult = useTarget();
  const oracleInfo = useOracleInfo(OraclePriceType.twap);

  useEffect(() => {
    if (vaultsData) {
      setPrevData(vaultsData);
    }
  }, [vaultsData]);

  const vaultsDataToUse = vaultsData ?? prevData;

  const currentVaults = useMemo(() => {
    if (
      (vaultsFetching && !prevData) ||
      !vaultsDataToUse?.vaults ||
      !paprBalance
    )
      return null;
    if (vaultsDataToUse.vaults.length === 0) return null;

    return vaultsDataToUse.vaults.filter((v) => {
      const hasAuctionProceedsToClaim =
        paprBalance.gt(0) && v.pastAuctions.length > 0;
      const hasOngoingAuctions = v.ongoingAuctions.length > 0;

      return (
        v.collateral.length > 0 ||
        !ethers.BigNumber.from(v.debt).isZero() ||
        hasAuctionProceedsToClaim ||
        hasOngoingAuctions
      );
    });
  }, [prevData, vaultsFetching, vaultsDataToUse, paprBalance]);

  useEffect(() => {
    if (!currentVaults || !oracleInfo || !targetResult) return;
    const vaultsWithRiskLevel = currentVaults.map((vault) => {
      const maxDebt = calculateMaxDebt(
        vault.token.id,
        oracleInfo,
        targetResult,
        maxLTV,
        underlying.decimals
      );
      if (!maxDebt) return { ...vault, riskLevel: "fine" as RiskLevel };
      const riskLevel = riskLevelFromDebts(
        vault.debt,
        maxDebt,
        paprToken.decimals
      );
      return { ...vault, riskLevel };
    });
    setVaultsWithRiskLevel(vaultsWithRiskLevel);
  }, [
    currentVaults,
    oracleInfo,
    targetResult,
    maxLTV,
    underlying.decimals,
    paprToken.decimals,
  ]);

  return {
    currentVaults: vaultsWithRiskLevel,
    vaultsFetching,
    reexecuteQuery,
  };
}
