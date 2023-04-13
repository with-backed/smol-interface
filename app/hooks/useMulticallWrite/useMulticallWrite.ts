import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { useMemo } from "react";
import { paprControllerABI, paprControllerAddress } from "types/generatedABI";

export function useMulticallWrite(
  calldata: string[],
  skip: boolean,
  refresh: () => void
) {
  const { config: multicallConfig } = usePrepareContractWrite({
    address: skip ? undefined : (paprControllerAddress[1] as `0x${string}`),
    abi: paprControllerABI,
    functionName: "multicall",
    args: [calldata as `0x${string}`[]],
  });
  const configWithGasOverride = useMemo(() => {
    if (!multicallConfig.request) return multicallConfig;
    return {
      ...multicallConfig,
      request: {
        ...multicallConfig.request,
        gasLimit: multicallConfig.request.gasLimit.add(5000),
      },
    };
  }, [multicallConfig]);

  const { data, write, error } = useContractWrite({
    ...configWithGasOverride,
    onSuccess: (data) => {
      data.wait().then(refresh);
    },
  });

  return { data, write, error };
}
