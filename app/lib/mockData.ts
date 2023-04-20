import { ethers } from "ethers";
import { Auction } from "~/gql/graphql";
import { SubgraphVault } from "~/hooks/useVault";

export const ongoingAuction = {
  id: "58395562003121734473798184899530575394043342119921513301544088641480541874295",
  auctionAssetID: "10",
  startedBy: "0xe89cb2053a04daf86abaa1f4bc6d50744e57d39e",
  startPrice: "87691387419546085",
  endPrice: "78082127809549404",
  secondsInPeriod: "86400",
  perPeriodDecayPercentWad: "700000000000000000",
  start: {
    timestamp: 1681158708,
  },
  end: null,
};

export const pastAuction = {
  id: "58395562003121734473798184899530575394043342119921513301544088641480541874295",
  auctionAssetID: "10",
  startedBy: "0xe89cb2053a04daf86abaa1f4bc6d50744e57d39e",
  startPrice: "87691387419546085",
  endPrice: "78082127809549404",
  secondsInPeriod: "86400",
  perPeriodDecayPercentWad: "700000000000000000",
  start: {
    timestamp: 1681158708,
  },
  end: {
    timestamp: 1682017032,
    id: "0x3f26f11d761e5ae4e07d0e39e0390eb43b59bf37365ff2d0d94f01845a569399",
  },
};

export const vaultWithDebtAndCollateral: Partial<NonNullable<SubgraphVault>> = {
  debt: ethers.utils.parseEther("1"),
  collateral: [
    {
      id: "0xc5d0b6e5b7f01390e363b9a721efb1a1ca301068-21",
      tokenId: "21",
    },
  ],
  collateralCount: 1,
  latestIncreaseDebt: 1682017031,
  ongoingAuctions: [],
  pastAuctions: [],
};

export const vaultWithDebtAndNoCollateral: Partial<NonNullable<SubgraphVault>> =
  {
    debt: ethers.utils.parseEther("1"),
    collateral: [],
    collateralCount: 0,
    latestIncreaseDebt: 1682017031,
    ongoingAuctions: [ongoingAuction as Auction],
    pastAuctions: [],
  };

export const vaultWithDebtAndCollateralAndPastAuction: Partial<
  NonNullable<SubgraphVault>
> = {
  debt: ethers.utils.parseEther("1"),
  collateral: [
    {
      id: "0xc5d0b6e5b7f01390e363b9a721efb1a1ca301068-21",
      tokenId: "21",
    },
  ],
  collateralCount: 1,
  latestIncreaseDebt: 1682017031,
  ongoingAuctions: [],
  pastAuctions: [pastAuction as Auction],
};

export const vaultWithNoDebtAndNoCollateral: Partial<
  NonNullable<SubgraphVault>
> = {
  debt: ethers.utils.parseEther("0"),
  collateral: [],
  collateralCount: 0,
  latestIncreaseDebt: 1682017031,
  ongoingAuctions: [],
  pastAuctions: [],
};

export const vaultWithNoDebtAndNoCollateralAndPastAuction: Partial<
  NonNullable<SubgraphVault>
> = {
  debt: ethers.utils.parseEther("0"),
  collateral: [],
  collateralCount: 0,
  latestIncreaseDebt: 1682017031,
  ongoingAuctions: [],
  pastAuctions: [pastAuction as Auction],
};

export const vaultWithDebtAndCollateralAndPastAuctionBeforeLatestLoan: Partial<
  NonNullable<SubgraphVault>
> = {
  debt: ethers.utils.parseEther("1"),
  collateral: [
    {
      id: "0xc5d0b6e5b7f01390e363b9a721efb1a1ca301068-21",
      tokenId: "21",
    },
  ],
  collateralCount: 1,
  latestIncreaseDebt: 1682017031,
  ongoingAuctions: [],
  pastAuctions: [
    {
      ...pastAuction,
      end: {
        timestamp: 1682017030,
        id: "0x3f26f11d761e5ae4e07d0e39e0390eb43b59bf37365ff2d0d94f01845a569399",
      },
    } as Auction,
  ],
};
