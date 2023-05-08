import { useCallback, useEffect, useMemo } from "react";
import type { RiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";
import { HeaderState, SelectedVaultLoading } from "./";
import type { SubgraphVault } from "~/hooks/useVault";
import { useRiskLevel } from "~/hooks/useRiskLevel";
import { LoanDetailsForExistingLoan } from "./LoanDetailsForExistingLoan";
import { useHeaderDisclosureState } from "~/hooks/useHeaderDisclosureState";

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
  vault: NonNullable<SubgraphVault>;
  index: number;
};

function ExistingLoan({ vault, index }: ExistingLoanProps) {
  const selectedVault = useGlobalStore((s) => s.selectedVault);
  const setSelectedVault = useGlobalStore((s) => s.setSelectedVault);
  const state = useGlobalStore((s) => s.state);
  const { setVisible } = useHeaderDisclosureState();
  const riskLevelResult = useRiskLevel(
    useMemo(
      () => ({
        collateralAddress: vault.token.id,
        collateralCount: vault.collateral.length,
        debt: vault.debt,
      }),
      [vault]
    )
  );

  const selectVaultAsCurrent = useCallback(
    (vault: NonNullable<SubgraphVault>, riskLevel: RiskLevel) => {
      setSelectedVault({ ...vault, riskLevel });
      setVisible(false);
    },
    [setSelectedVault, setVisible]
  );

  // setting the initial/default selectedVault
  // TODO: adamgobes, potentially sort by risk level and default to highest risk loan
  useEffect(() => {
    if (selectedVault) return;
    if (index === 0 && riskLevelResult && state === HeaderState.Default)
      selectVaultAsCurrent(vault, riskLevelResult.riskLevel);
  }, [
    selectedVault,
    state,
    index,
    riskLevelResult,
    selectVaultAsCurrent,
    vault,
  ]);

  if (!riskLevelResult) return <SelectedVaultLoading />;

  return (
    <div
      className="my-1 cursor-pointer"
      key={vault.id}
      onClick={() => selectVaultAsCurrent(vault, riskLevelResult.riskLevel)}
    >
      <LoanDetailsForExistingLoan
        vault={{ ...vault, riskLevel: riskLevelResult.riskLevel }}
      />
    </div>
  );
}
