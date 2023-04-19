import { create } from "zustand";
import type { VaultsByOwnerForControllerQuery } from "~/gql/graphql";
import { HeaderState } from "~/components/Header/HeaderState";
import type { ethers } from "ethers";
import { SubgraphVault } from "~/hooks/useVault";

export type RiskLevel = "fine" | "risky" | "rekt";

interface InProgressLoan {
  collectionAddress: string | null;
  tokenIds: string[];
  // maximum debt they can take for the collection based on how many of that NFT they have, in papr
  maxDebtForCollection: ethers.BigNumber | null;
  // maximum debt they can take for the # of tokenIds chosen, in papr
  // this cannot be derived, since we need to know the total # of tokenIds they have
  maxDebtForChosen: ethers.BigNumber | null; // in papr
  riskLevel: RiskLevel;
  amount: ethers.BigNumber | null; // in papr
}

const emptyInProgressLoan: InProgressLoan = {
  collectionAddress: null,
  tokenIds: [],
  maxDebtForCollection: null,
  maxDebtForChosen: null,
  riskLevel: "fine",
  amount: null,
};

export type VaultWithRiskLevel =
  | (SubgraphVault & { riskLevel: RiskLevel })
  | null;

interface GlobalStore {
  state: HeaderState;
  setHeaderState: (newState: HeaderState) => void;
  currentVaults: VaultsByOwnerForControllerQuery["vaults"] | null;
  setCurrentVaults: (
    currentVaults: VaultsByOwnerForControllerQuery["vaults"]
  ) => void;
  refreshCurrentVaults: () => void;
  setRefreshCurrentVaults: (refreshCurrentVaults: () => void) => void;
  selectedVault: VaultWithRiskLevel;
  setSelectedVault: (selectedVault: VaultWithRiskLevel) => void;
  inProgressLoan: InProgressLoan;
  setInProgressLoan: (fn: (prev: InProgressLoan) => InProgressLoan) => void;
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
  selectedVault: null,
  setSelectedVault: (selectedVault) => set({ selectedVault }),
  inProgressLoan: emptyInProgressLoan,
  setInProgressLoan: (fn) =>
    set((state) => ({ inProgressLoan: fn(state.inProgressLoan) })),
  clear: () =>
    set({
      state: HeaderState.Default,
      inProgressLoan: emptyInProgressLoan,
    }),
}));
