import { usePaprController } from "~/hooks/usePaprController";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "urql";
import { graphql } from "~/gql";
import type { VaultsByOwnerForControllerQuery } from "~/gql/graphql";

const vaultsDocument = graphql(`
  query vaultsByOwnerForController($owner: Bytes, $controller: String) {
    vaults(where: { account: $owner, controller: $controller }) {
      ...allVaultProperties
    }
  }
`);

export function useCurrentVaults(user: string | undefined) {
  const { id } = usePaprController();
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

  useEffect(() => {
    if (vaultsData) {
      setPrevData(vaultsData);
    }
  }, [vaultsData]);

  const vaultsDataToUse = vaultsData ?? prevData;

  const currentVaults = useMemo(() => {
    if ((vaultsFetching && !prevData) || !vaultsDataToUse?.vaults) return null;
    if (vaultsDataToUse.vaults.length === 0) return null;

    return vaultsDataToUse.vaults;
  }, [prevData, vaultsFetching, vaultsDataToUse]);

  return {
    currentVaults,
    vaultsFetching,
    reexecuteQuery,
  };
}