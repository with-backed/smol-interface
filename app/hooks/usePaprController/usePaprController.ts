import { BigNumberish } from "ethers";
import { graphql } from "~/gql";
import { createGenericContext } from "~/lib/createGenericContext";

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

const allActivityProperties = graphql(`
  fragment allActivityProperties on Activity {
    id
    timestamp
    user
    sqrtPricePool
    tickCurrent
    amountBorrowed
    amountRepaid
    amountIn
    amountOut
    clientFeeBips
    vault {
      ...allVaultProperties
    }
    tokenIn {
      ...allERC20Properties
    }
    tokenOut {
      ...allERC20Properties
    }
    addedCollateral {
      id
      collateral {
        id
      }
      tokenId
    }
    removedCollateral {
      id
      collateral {
        id
      }
      tokenId
    }
    auctionCollateral {
      ...allERC721Properties
    }
    auctionTokenId
    auctionEndPrice
    cumulativeLiquidity
    cumulativeToken0
    cumulativeToken1
    liquidityDelta
    token0Delta
    token1Delta
    uniswapLiquidityPosition {
      id
      tickLower
      tickUpper
    }
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

interface ERC20Token {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface ERC721Token {
  id: string;
  name: string;
  symbol: string;
}

interface AllowedCollateral {
  id: string;
  token: ERC721Token;
  allowed: boolean;
}

export interface PaprController {
  id: string;
  paprToken: ERC20Token;
  underlying: ERC20Token;
  allowedCollateral: AllowedCollateral[];
  token0IsUnderlying: boolean;
  poolAddress: string;
  maxLTV: BigNumberish;
  fundingPeriod: BigNumberish;
  currentTarget: BigNumberish;
  currentTargetUpdated: number;
  vaults?:
    | {
        id: string;
        token: ERC721Token;
        debt: BigNumberish;
        collateralCount: number;
        account: string;
        collateral:
          | {
              id: string;
              tokenId: string;
            }[];
      }[]
    | null
    | undefined;
}

const [useControllerContext, ControllerContextProvider] =
  createGenericContext<PaprController>();

function usePaprController(): PaprController {
  const controller = useControllerContext();
  return controller;
}

export { ControllerContextProvider, usePaprController };
