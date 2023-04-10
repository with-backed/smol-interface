import { useQuery } from "urql";
import { graphql } from "~/gql";

const allPaprControllerProperties = graphql(`
  fragment allPaprControllerProperties on PaprController {
    id
    createdAt
    token0IsUnderlying
    poolAddress
    underlying {
      ...allERC20Properties
    }
    paprToken {
      ...allERC20Properties
    }
    maxLTV
    fundingPeriod
    currentTarget
    currentTargetUpdated
    allowedCollateral(where: { allowed: true }) {
      id
      token {
        ...allERC721Properties
      }
      allowed
    }
    vaults {
      ...allVaultProperties
    }
  }
`);

const allERC721Properties = graphql(`
  fragment allERC721Properties on ERC721Token {
    id
    name
    symbol
  }
`);

const allERC20Properties = graphql(`
  fragment allERC20Properties on ERC20Token {
    id
    name
    symbol
    decimals
  }
`);

const allVaultProperties = graphql(`
  fragment allVaultProperties on Vault {
    id
    account
    debt
    token {
      ...allERC721Properties
    }
    collateral {
      id
      tokenId
    }
    collateralCount
  }
`);

const paprControllerByIdDocument = graphql(`
  query paprControllerById($id: ID!) {
    paprController(id: $id) {
      ...allPaprControllerProperties
      vaults {
        ...allVaultProperties
      }
    }
  }
`);

export function usePaprController(id: string) {
  return useQuery({ query: paprControllerByIdDocument, variables: { id } });
}
