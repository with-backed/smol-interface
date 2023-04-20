import { ethers } from "ethers";
import type { SubgraphVault } from "app/hooks/useVault";
import {
  isCurrentAuctionWithRepay,
  isPastAuctionWithClaim,
  isPastAuctionWithRepay,
} from "app/lib/auctionStates";
import {
  vaultWithDebtAndCollateral,
  vaultWithDebtAndCollateralAndPastAuction,
  vaultWithDebtAndCollateralAndPastAuctionBeforeLatestLoan,
  vaultWithDebtAndNoCollateral,
  vaultWithNoDebtAndNoCollateralAndPastAuction,
} from "app/lib/mockData";

describe("auction state helpers", () => {
  describe("isCurrentAuctionWithRepay", () => {
    it("returns false for a vault with no auctions", () => {
      expect(
        isCurrentAuctionWithRepay(
          vaultWithDebtAndCollateral as NonNullable<SubgraphVault>
        )
      ).toBe(false);
    });

    it("returns true for a vault with debt and no collateral (meaning an ongoing auction must be happening", () => {
      expect(
        isCurrentAuctionWithRepay(
          vaultWithDebtAndNoCollateral as NonNullable<SubgraphVault>
        )
      ).toBe(true);
    });

    describe("isPastAuctionWithRepay", () => {
      it("returns false for a vault with no auctions", () => {
        expect(
          isPastAuctionWithRepay(
            vaultWithDebtAndCollateral as NonNullable<SubgraphVault>
          )
        ).toBe(false);
      });

      it("returns false for a vault with a past auction, but that auction was before the latest increase debt", () => {
        expect(
          isPastAuctionWithRepay(
            vaultWithDebtAndCollateralAndPastAuctionBeforeLatestLoan as NonNullable<SubgraphVault>
          )
        ).toBe(false);
      });

      it("returns true for a vault with a past auction", () => {
        expect(
          isPastAuctionWithRepay(
            vaultWithDebtAndCollateralAndPastAuction as NonNullable<SubgraphVault>
          )
        ).toBe(true);
      });
    });

    describe("isPastAuctionWithClaim", () => {
      it("returns false for a vault with no auctions", () => {
        expect(
          isPastAuctionWithClaim(
            vaultWithDebtAndCollateral as NonNullable<SubgraphVault>,
            ethers.BigNumber.from(1)
          )
        ).toBe(false);
      });

      it("returns false for a vault with a past auction that has debt (this means there is no claim)", () => {
        expect(
          isPastAuctionWithClaim(
            vaultWithDebtAndCollateralAndPastAuction as NonNullable<SubgraphVault>,
            ethers.BigNumber.from(1)
          )
        ).toBe(false);
      });

      it("returns false for a vault with a past auction if the user has no papr balance", () => {
        expect(
          isPastAuctionWithClaim(
            vaultWithNoDebtAndNoCollateralAndPastAuction as NonNullable<SubgraphVault>,
            ethers.BigNumber.from(0)
          )
        ).toBe(false);
      });

      it("returns true for a vault with a past auction if the user has a papr balance greater than zero", () => {
        expect(
          isPastAuctionWithClaim(
            vaultWithNoDebtAndNoCollateralAndPastAuction as NonNullable<SubgraphVault>,
            ethers.BigNumber.from(1)
          )
        ).toBe(true);
      });
    });
  });
});
