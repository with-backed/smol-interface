import { create } from "zustand";
import type { VaultsByOwnerForControllerQuery } from "~/gql/graphql";
import { HeaderState } from "~/components/Header/HeaderState";
import type { ethers } from "ethers";

export type RiskLevel = "fine" | "risky" | "rekt";

interface SelectedLoan {
  collectionAddress: string | null;
  tokenIds: string[];
  // maximum debt they can take for the collection based on how many of that NFT they have, in papr
  maxDebtForCollection: ethers.BigNumber | null;
  // maximum debt they can take for the # of tokenIds chosen, in papr
  // this cannot be derived, since we need to know the total # of tokenIds they have
  maxDebtForChosen: ethers.BigNumber | null; // in papr
  riskLevel: RiskLevel;
  amountBorrow: ethers.BigNumber | null; // in papr
  amountRepay: ethers.BigNumber | null; // in papr
  isExistingLoan: boolean;
}

const emptySelectedLoan: SelectedLoan = {
  collectionAddress: null,
  tokenIds: [],
  maxDebtForCollection: null,
  maxDebtForChosen: null,
  riskLevel: "fine",
  amountBorrow: null,
  amountRepay: null,
  isExistingLoan: false,
};

interface GlobalStore {
  state: HeaderState;
  setHeaderState: (newState: HeaderState) => void;
  currentVaults: VaultsByOwnerForControllerQuery["vaults"] | null;
  setCurrentVaults: (
    currentVaults: VaultsByOwnerForControllerQuery["vaults"]
  ) => void;
  refreshCurrentVaults: () => void;
  setRefreshCurrentVaults: (refreshCurrentVaults: () => void) => void;
  selectedLoan: SelectedLoan;
  setSelectedLoan: (fn: (prev: SelectedLoan) => SelectedLoan) => void;
  showHowMuchBorrow: boolean;
  setShowHowMuchBorrow: (showHowMuchBorrow: boolean) => void;
  clear: () => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  state: HeaderState.Default,
  setHeaderState: (state) => set({ state }),
  currentVaults: null,
  setCurrentVaults: (currentVaults) => set({ currentVaults }),
  refreshCurrentVaults: () => null,
  setRefreshCurrentVaults: (refreshCurrentVaults) =>
    set({ refreshCurrentVaults }),
  selectedLoan: emptySelectedLoan,
  setSelectedLoan: (fn: (prev: SelectedLoan) => SelectedLoan) =>
    set((state) => ({ selectedLoan: fn(state.selectedLoan) })),
  showHowMuchBorrow: false,
  setShowHowMuchBorrow: (showHowMuchBorrow: boolean) =>
    set({ showHowMuchBorrow }),
  clear: () =>
    set({
      state: HeaderState.Default,
      selectedLoan: emptySelectedLoan,
      showHowMuchBorrow: false,
    }),
}));
