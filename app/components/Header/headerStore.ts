import { create } from "zustand";
import type { VaultsByOwnerForControllerQuery } from "~/gql/graphql";
import { HeaderState } from "./HeaderState";

interface HeaderStore {
  state: HeaderState;
  setHeaderState: (newState: HeaderState) => void;
  currentVaults: VaultsByOwnerForControllerQuery["vaults"] | null;
  setCurrentVaults: (
    currentVaults: VaultsByOwnerForControllerQuery["vaults"]
  ) => void;
  selectedCollectionAddress: string | null;
  setSelectedCollectionAddress: (
    selectedCollectionAddress: string | null
  ) => void;
  selectedTokenIds: string[];
  setSelectedTokenIds: (selectedTokenIds: string[]) => void;
  showHowMuchBorrow: boolean;
  setShowHowMuchBorrow: (showHowMuchBorrow: boolean) => void;
  clear: () => void;
}

export const useHeaderStore = create<HeaderStore>((set) => ({
  state: HeaderState.Default,
  setHeaderState: (state) => set({ state }),
  currentVaults: null,
  setCurrentVaults: (currentVaults) => set({ currentVaults }),
  selectedCollectionAddress: null,
  setSelectedCollectionAddress: (selectedCollectionAddress) =>
    set({ selectedCollectionAddress }),
  selectedTokenIds: [],
  setSelectedTokenIds: (selectedTokenIds) => set({ selectedTokenIds }),
  showHowMuchBorrow: false,
  setShowHowMuchBorrow: (showHowMuchBorrow: boolean) =>
    set({ showHowMuchBorrow }),
  clear: () =>
    set({
      state: HeaderState.Default,
      selectedCollectionAddress: null,
      selectedTokenIds: [],
      showHowMuchBorrow: false,
    }),
}));
