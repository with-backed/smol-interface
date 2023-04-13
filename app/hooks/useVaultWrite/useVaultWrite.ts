import { useMemo } from "react";
import { useAccount } from "wagmi";

import {
  generateBorrowWithSwapCalldata,
  generateRepayWithSwapCalldata,
  VaultWriteType,
} from "./helpers";
import { ethers } from "ethers";
import { useOracleInfo } from "~/hooks/useOracleInfo";
import { OraclePriceType } from "~/lib/reservoir";
import { useModifyCollateralCalldata } from "~/hooks/useModifyCollateralCalldata";
import { useMulticallWrite } from "~/hooks/useMulticallWrite";
import { deconstructFromId } from "~/lib/utils";
import { useSwapParams } from "~/hooks/useSwapParams";
import { useSafeTransferFromWrite } from "~/hooks/useSafeTransferFromWrite";

export function useVaultWrite(
  writeType: VaultWriteType,
  collateralContractAddress: string,
  depositNFTs: string[],
  withdrawNFTs: string[],
  amount: ethers.BigNumber,
  quote: ethers.BigNumber | null,
  usingSafeTransferFrom: boolean,
  disabled: boolean,
  refresh: () => void
) {
  const { address } = useAccount();
  const oracleInfo = useOracleInfo(OraclePriceType.lower);
  const swapParams = useSwapParams(amount, quote);

  const { addCollateralCalldata, removeCollateralCalldata } =
    useModifyCollateralCalldata(depositNFTs, withdrawNFTs);

  const borrowOrRepayCalldata = useMemo(() => {
    switch (writeType) {
      case VaultWriteType.BorrowWithSwap:
        return generateBorrowWithSwapCalldata(
          collateralContractAddress,
          address!,
          swapParams,
          oracleInfo
        );
      case VaultWriteType.RepayWithSwap:
        return generateRepayWithSwapCalldata(
          collateralContractAddress,
          address!,
          swapParams
        );
    }
  }, [writeType, collateralContractAddress, address, swapParams, oracleInfo]);

  const calldata = useMemo(() => {
    if (writeType === VaultWriteType.BorrowWithSwap) {
      return [
        addCollateralCalldata,
        removeCollateralCalldata,
        borrowOrRepayCalldata,
      ].filter((c) => !!c);
    } else {
      return [
        borrowOrRepayCalldata,
        addCollateralCalldata,
        removeCollateralCalldata,
      ].filter((c) => !!c);
    }
  }, [
    writeType,
    borrowOrRepayCalldata,
    addCollateralCalldata,
    removeCollateralCalldata,
  ]);

  const {
    data: multicallData,
    write: multicallWrite,
    error: multicallError,
  } = useMulticallWrite(calldata, disabled, refresh);

  const [_, nftTokenId] = useMemo(() => {
    if (depositNFTs.length === 0) return [ethers.constants.AddressZero, "0"];
    return deconstructFromId(depositNFTs[0]);
  }, [depositNFTs]);
  const {
    data: safeTransferFromData,
    write: safeTransferFromWrite,
    error: safeTransferFromError,
  } = useSafeTransferFromWrite(
    collateralContractAddress,
    nftTokenId,
    amount,
    quote,
    disabled,
    refresh
  );

  const { data, write, error } = useMemo(() => {
    if (usingSafeTransferFrom)
      return {
        data: safeTransferFromData,
        write: safeTransferFromWrite,
        error: safeTransferFromError,
      };
    else {
      return {
        data: multicallData,
        write: multicallWrite,
        error: multicallError,
      };
    }
  }, [
    safeTransferFromData,
    safeTransferFromWrite,
    safeTransferFromError,
    multicallData,
    multicallWrite,
    multicallError,
    usingSafeTransferFrom,
  ]);

  return { data, write, error };
}
