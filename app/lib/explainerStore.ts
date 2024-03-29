import { create } from "zustand";

export type Explainer = "value" | "lava" | "what-is";

interface ExplainerStore {
  activeExplainer: Explainer | null;
  setActiveExplainer: (activeExplainer: Explainer | null) => void;
}

export const useExplainerStore = create<ExplainerStore>((set) => ({
  activeExplainer: null,
  setActiveExplainer: (activeExplainer) => set({ activeExplainer }),
}));
