import { usePaprController } from "~/hooks/usePaprController";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "urql";
import { graphql } from "~/gql";
import type { VaultsByOwnerForControllerQuery } from "~/gql/graphql";
import { ethers } from "ethers";
import { erc20ABI, useAccount, useContractRead } from "wagmi";

const vaultsDocument = graphql(`
  query vaultsByOwnerForController($owner: Bytes, $controller: String) {
    vaults(where: { account: $owner, controller: $controller }) {
      ...allVaultProperties
    }
  }
`);

export function useCurrentVaults(user: string | undefined) {
  const { id, paprToken } = usePaprController();
  const { address } = useAccount();
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

  return {
    currentVaults,
    vaultsFetching,
    reexecuteQuery,
  };
}
