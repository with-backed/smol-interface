import { create } from "zustand";
import type { VaultsByOwnerForControllerQuery } from "~/gql/graphql";
import { HeaderState } from "~/components/Header/HeaderState";
import type { ethers } from "ethers";

interface SelectedLoan {
  collectionAddress: string | null;
  tokenIds: string[];
  maxDebt: ethers.BigNumber | null;
  amountBorrow: ethers.BigNumber | null;
  amountRepay: ethers.BigNumber | null;
}

const emptySelectedLoan = {
  collectionAddress: null,
  tokenIds: [],
  maxDebt: null,
  amountBorrow: null,
  amountRepay: null,
};

interface GlobalStore {
  state: HeaderState;
  setHeaderState: (newState: HeaderState) => void;
  currentVaults: VaultsByOwnerForControllerQuery["vaults"] | null;
  setCurrentVaults: (
    currentVaults: VaultsByOwnerForControllerQuery["vaults"]
  ) => void;
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
