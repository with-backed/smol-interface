import { ethers } from "ethers";
import { paprControllerABI } from "types/generatedABI";
import { oracleInfoArgEncoded, swapParamsArgEncoded } from "~/lib/constants";
import type { OracleInfoStruct } from "~/lib/reservoir";
import { getOraclePayloadFromReservoirObject } from "~/lib/reservoir";
import type { OracleInfo } from "~/hooks/useOracleInfo";
import type { SwapParamsStruct } from "~/hooks/useSwapParams";

export enum VaultWriteType {
  BorrowWithSwap = "borrowWithSwap",
  RepayWithSwap = "repayWithSwap",
}

const paprControllerIFace = new ethers.utils.Interface(paprControllerABI);

const IncreaseAndSwapEncoderString = `increaseDebtAndSell(address proceedsTo, address collateralAsset, ${swapParamsArgEncoded}, ${oracleInfoArgEncoded})`;
interface IncreaseAndSwapStruct {
  proceedsTo: string;
  collateralAsset: string;
  swapParams: SwapParamsStruct;
  oracleInfo: OracleInfoStruct;
}
export function generateBorrowWithSwapCalldata(
  collateralContractAddress: string,
  address: string | undefined,
  swapParams: SwapParamsStruct,
  oracleInfo: OracleInfo | undefined
) {
  if (!address) return "";

  const borrowWithSwapArgs: IncreaseAndSwapStruct = {
    proceedsTo: address,
    collateralAsset: collateralContractAddress,
    swapParams,
    oracleInfo: getOraclePayloadFromReservoirObject(
      oracleInfo && oracleInfo[collateralContractAddress]
    ),
  };

  return paprControllerIFace.encodeFunctionData(IncreaseAndSwapEncoderString, [
    borrowWithSwapArgs.proceedsTo,
    borrowWithSwapArgs.collateralAsset,
    borrowWithSwapArgs.swapParams,
    borrowWithSwapArgs.oracleInfo,
  ]);
}

const BuyAndReduceEncoderString = `buyAndReduceDebt(address account, address collateralAsset, ${swapParamsArgEncoded})`;
interface BuyAndReduceArgsStruct {
  account: string;
  collateralAsset: string;
  swapParams: SwapParamsStruct;
}
export function generateRepayWithSwapCalldata(
  collateralContractAddress: string,
  address: string | undefined,
  swapParams: SwapParamsStruct
) {
  if (!address) return "";
  const repayWithSwapArgs: BuyAndReduceArgsStruct = {
    account: address,
    collateralAsset: collateralContractAddress,
    swapParams,
  };

  return paprControllerIFace.encodeFunctionData(BuyAndReduceEncoderString, [
    repayWithSwapArgs.account,
    repayWithSwapArgs.collateralAsset,
    repayWithSwapArgs.swapParams,
  ]);
}
