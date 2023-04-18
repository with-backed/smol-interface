import { useCallback, useEffect } from "react";
import { getAddress } from "ethers/lib/utils";
import type { RiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";
import { HeaderState, LoanDetails } from "./";
import { ethers } from "ethers";
import type { SubgraphVault } from "~/hooks/useVault";
import { useRiskLevel } from "~/hooks/useRiskLevel";

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
  const setSelectedLoan = useGlobalStore((s) => s.setSelectedLoan);
  const state = useGlobalStore((s) => s.state);
  const riskLevel = useRiskLevel(vault);

  const selectVaultAsCurrent = useCallback(
    (vault: NonNullable<SubgraphVault>, riskLevel: RiskLevel) => {
      setSelectedLoan((_prev) => ({
        collectionAddress: getAddress(vault.token.id),
        tokenIds: vault.collateral.map((c) => c.tokenId),
        amountRepay: ethers.BigNumber.from(vault.debt),
        amountBorrow: null,
        riskLevel,
        maxDebtForCollection: null,
        maxDebtForChosen: null,
        isExistingLoan: true,
      }));
    },
    [setSelectedLoan]
  );

  useEffect(() => {
    if (index === 0 && riskLevel && state === HeaderState.Default)
      selectVaultAsCurrent(vault, riskLevel);
  }, [state, index, riskLevel, selectVaultAsCurrent, vault]);

  if (!riskLevel) return <></>;

  return (
    <div
      className="my-1 cursor-pointer"
      key={vault.id}
      onClick={() => selectVaultAsCurrent(vault, riskLevel)}
    >
      <LoanDetails
        collectionAddress={vault.token.id}
        tokenIds={vault.collateral.map((c) => c.tokenId)}
        riskLevel={riskLevel}
        type="repay"
        amountToBorrowOrRepay={ethers.BigNumber.from(vault.debt)}
      />
    </div>
  );
}
