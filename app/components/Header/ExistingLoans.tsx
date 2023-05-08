import { useCallback, useEffect, useMemo } from "react";
import type { VaultWithRiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";
import { HeaderState } from "./";
import { LoanDetailsForExistingLoan } from "./LoanDetailsForExistingLoan";
import { useHeaderDisclosureState } from "~/hooks/useHeaderDisclosureState";
import { useMatches, useNavigate } from "@remix-run/react";
import { PAGES } from "../Footer/Footer";

export function ExistingLoans() {
  const currentVaults = useGlobalStore((s) => s.currentVaults);

  if (!currentVaults) return <></>;

  return (
    <div className="flex flex-col w-full">
      {currentVaults.map((v, i) => {
        return (
          <div className="my-1" key={v.id}>
            <ExistingLoan vault={v} index={i} />
          </div>
        );
      })}
    </div>
  );
}

type ExistingLoanProps = {
  vault: VaultWithRiskLevel;
  index: number;
};

function ExistingLoan({ vault, index }: ExistingLoanProps) {
  const selectedVault = useGlobalStore((s) => s.selectedVault);
  const setSelectedVault = useGlobalStore((s) => s.setSelectedVault);
  const state = useGlobalStore((s) => s.state);
  const { setVisible } = useHeaderDisclosureState();
  const navigate = useNavigate();
  const matches = useMatches();

  const currentRoute = useMemo(() => {
    return matches[matches.length - 1].pathname;
  }, [matches]);

  const selectVaultAsCurrent = useCallback(
    (vault: VaultWithRiskLevel, withRedirect: boolean) => {
      setSelectedVault(vault);
      setVisible(false);
      if (currentRoute !== PAGES[3] && withRedirect) {
        navigate(PAGES[4]);
      }
    },
    [setSelectedVault, setVisible, currentRoute, navigate]
  );

  // setting the initial/default selectedVault
  useEffect(() => {
    if (selectedVault) return;
    if (index === 0 && state === HeaderState.Default)
      selectVaultAsCurrent(vault, false);
  }, [selectedVault, state, index, selectVaultAsCurrent, vault]);

  return (
    <div
      className="my-1 cursor-pointer"
      key={vault.id}
      onClick={() => selectVaultAsCurrent(vault, true)}
    >
      <LoanDetailsForExistingLoan vault={vault} />
    </div>
  );
}
