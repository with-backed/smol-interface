import { ethers } from "ethers";
import type { SubgraphVault } from "app/hooks/useVault";
import { isAuctionWithClaim, isAuctionWithRepay } from "app/lib/auctionStates";
import {
  vaultWithDebtAndCollateral,
  vaultWithDebtAndCollateralAndPastAuction,
  vaultWithDebtAndCollateralAndPastAuctionBeforeLatestLoan,
  vaultWithDebtAndNoCollateral,
  vaultWithNoDebtAndNoCollateralAndPastAuction,
} from "app/lib/mockData";

describe("auction state helpers", () => {
  describe("isAuctionWithRepay", () => {
    it("returns false for a vault with no auctions", () => {
      expect(
        isAuctionWithRepay(
          vaultWithDebtAndCollateral as NonNullable<SubgraphVault>
        )
      ).toBe(false);
    });

    it("returns true for a vault with debt and no collateral (meaning an ongoing auction must be happening", () => {
      expect(
        isAuctionWithRepay(
          vaultWithDebtAndNoCollateral as NonNullable<SubgraphVault>
        )
      ).toBe(true);
    });

    it("returns false for a vault with a past auction, but that auction was before the latest increase debt", () => {
      expect(
        isAuctionWithRepay(
          vaultWithDebtAndCollateralAndPastAuctionBeforeLatestLoan as NonNullable<SubgraphVault>
        )
      ).toBe(false);
    });

    it("returns true for a vault with a past auction, but that auction was after the latest increase debt", () => {
      expect(
        isAuctionWithRepay(
          vaultWithDebtAndCollateralAndPastAuction as NonNullable<SubgraphVault>
        )
      ).toBe(true);
    });
  });

  describe("isAuctionWithClaim", () => {
    it("returns false for a vault with no auctions", () => {
      expect(
        isAuctionWithClaim(
          vaultWithDebtAndCollateral as NonNullable<SubgraphVault>,
          ethers.BigNumber.from(1)
        )
      ).toBe(false);
    });

    it("returns false for a vault with a past auction that has debt (this means there is no claim)", () => {
      expect(
        isAuctionWithClaim(
          vaultWithDebtAndCollateralAndPastAuction as NonNullable<SubgraphVault>,
          ethers.BigNumber.from(1)
        )
      ).toBe(false);
    });

    it("returns false for a vault with a past auction if the user has no papr balance", () => {
      expect(
        isAuctionWithClaim(
          vaultWithNoDebtAndNoCollateralAndPastAuction as NonNullable<SubgraphVault>,
          ethers.BigNumber.from(0)
        )
      ).toBe(false);
    });

    it("returns true for a vault with a past auction if the user has a papr balance greater than zero", () => {
      expect(
        isAuctionWithClaim(
          vaultWithNoDebtAndNoCollateralAndPastAuction as NonNullable<SubgraphVault>,
          ethers.BigNumber.from(1)
        )
      ).toBe(true);
    });
  });
});
