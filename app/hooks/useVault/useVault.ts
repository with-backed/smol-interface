import { useMemo } from "react";
import { useQuery } from "urql";
import { useAccount } from "wagmi";
import { graphql } from "~/gql";
import type { VaultbyIdQuery } from "~/gql/graphql";
import { usePaprController } from "~/hooks/usePaprController";

export type SubgraphVault = VaultbyIdQuery["vault"];

const vaultByIdDocument = graphql(`
  query vaultbyId($id: ID!) {
    vault(id: $id) {
      ...allVaultProperties
    }
  }
`);

export function useVault(collateralAddress: string) {
  const { id: controllerId } = usePaprController();
  const { address } = useAccount();
  const vaultId = useMemo(() => {
    return generateVaultId(controllerId, collateralAddress, address || "");
  }, [controllerId, collateralAddress, address]);

  const [{ data: vaultData, fetching }, reexecuteQuery] =
    useQuery<VaultbyIdQuery>({
      query: vaultByIdDocument,
      variables: {
        id: vaultId,
      },
    });

  return { vaultData, fetching, refreshVault: reexecuteQuery };
}

function generateVaultId(
  controllerId: string,
  collateralAddress: string,
  account: string
) {
  return `${controllerId.toLowerCase()}-${account.toLowerCase()}-${collateralAddress.toLowerCase()}`;
}
