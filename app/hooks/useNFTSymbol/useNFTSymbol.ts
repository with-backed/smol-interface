import { getAddress } from "ethers/lib/utils.js";
import { usePaprController } from "~/hooks/usePaprController";
import { useMemo } from "react";

export function useNFTSymbol(contractAddress: string) {
  const { allowedCollateral } = usePaprController();
  const nftSymbol = useMemo(
    () =>
      allowedCollateral.find(
        (ac) => getAddress(ac.token.id) === getAddress(contractAddress)
      )?.token.symbol || "",
    [allowedCollateral, contractAddress]
  );
  return nftSymbol;
}
