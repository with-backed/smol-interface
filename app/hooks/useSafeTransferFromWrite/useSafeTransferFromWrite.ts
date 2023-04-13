import {
  erc721ABI,
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { usePaprController } from "~/hooks/usePaprController";
import { useOracleInfo } from "~/hooks/useOracleInfo";
import { useSwapParams } from "~/hooks/useSwapParams";
import { useMemo } from "react";
import type { OracleInfoStruct } from "~/lib/reservoir";
import {
  OraclePriceType,
  getOraclePayloadFromReservoirObject,
} from "~/lib/reservoir";
import { ethers } from "ethers";
import { oracleInfoArgEncoded, swapParamsArgEncoded } from "~/lib/constants";
import type { SwapParamsStruct } from "~/hooks/useSwapParams";

const OnERC721ReceivedArgsEncoderString = `tuple(address proceedsTo, uint256 debt, ${swapParamsArgEncoded}, ${oracleInfoArgEncoded})`;

interface OnERC721ReceivedArgsStruct {
  proceedsTo: string;
  debt: ethers.BigNumber;
  swapParams: SwapParamsStruct;
  oracleInfo: OracleInfoStruct;
}

export function useSafeTransferFromWrite(
  nftContractAddress: string,
  nftTokenId: string,
  debt: ethers.BigNumber,
  quote: ethers.BigNumber | null,
  skip: boolean,
  refresh: () => void
) {
  const controller = usePaprController();
  const { address } = useAccount();
  const oracleInfo = useOracleInfo(OraclePriceType.lower);
  const swapParams = useSwapParams(debt, quote);

  const onERC721ReceivedData = useMemo(() => {
    const erc721ReceivedArgs: OnERC721ReceivedArgsStruct = {
      proceedsTo: address!,
      debt,
      swapParams,
      oracleInfo: getOraclePayloadFromReservoirObject(
        oracleInfo && oracleInfo[nftContractAddress]
      ),
    };
    return ethers.utils.defaultAbiCoder.encode(
      [OnERC721ReceivedArgsEncoderString],
      [erc721ReceivedArgs]
    );
  }, [debt, swapParams, oracleInfo, nftContractAddress, address]);

  const { config: safeTransferFromConfig } = usePrepareContractWrite({
    address: skip ? undefined : (nftContractAddress as `0x${string}`),
    abi: erc721ABI,
    functionName: "safeTransferFrom",
    args: [
      address as `0x${string}`,
      controller.id as `0x${string}`,
      ethers.BigNumber.from(nftTokenId),
      onERC721ReceivedData as `0x${string}`,
    ],
  });
  const configWithGasOverride = useMemo(() => {
    if (!safeTransferFromConfig.request) return safeTransferFromConfig;
    return {
      ...safeTransferFromConfig,
      request: {
        ...safeTransferFromConfig.request,
        gasLimit: safeTransferFromConfig.request.gasLimit.add(5000),
      },
    };
  }, [safeTransferFromConfig]);

  const { data, write, error } = useContractWrite({
    ...configWithGasOverride,
    onSuccess: (data) => {
      data.wait().then(refresh);
    },
  });

  return { data, write, error };
}
