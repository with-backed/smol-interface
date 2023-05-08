import { useCallback, useEffect } from "react";
import type { VaultWithRiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";
import { HeaderState } from "./";
import { LoanDetailsForExistingLoan } from "./LoanDetailsForExistingLoan";
import { useHeaderDisclosureState } from "~/hooks/useHeaderDisclosureState";
import { Link } from "@remix-run/react";

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

  const selectVaultAsCurrent = useCallback(
    (vault: VaultWithRiskLevel) => {
      setSelectedVault(vault);
      setVisible(false);
    },
    [setSelectedVault, setVisible]
  );

  // setting the initial/default selectedVault
  useEffect(() => {
    if (selectedVault) return;
    if (index === 0 && state === HeaderState.Default)
      selectVaultAsCurrent(vault);
  }, [selectedVault, state, index, selectVaultAsCurrent, vault]);

  return (
    <Link to="/five" className="no-underline">
      <div
        className="my-1 cursor-pointer"
        key={vault.id}
        onClick={() => selectVaultAsCurrent(vault)}
      >
        <LoanDetailsForExistingLoan vault={vault} />
      </div>
    </Link>
  );
}
