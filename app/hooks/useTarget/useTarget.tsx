import type { BigNumber } from "@ethersproject/bignumber";
import { useConfig } from "~/hooks/useConfig";
import { useTimestamp } from "~/hooks/useTimestamp";
import { BLOCKS_IN_A_DAY } from "~/lib/constants";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useContractRead } from "wagmi";

type TargetLookup = {
  now?: TargetUpdate | undefined;
  yesterday?: TargetUpdate | undefined;
};
const TargetContext = createContext<TargetLookup>({});

const newTargetAbi = [
  {
    name: "newTarget",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export type TargetUpdate = {
  target: BigNumber;
  timestamp: number;
};

export const TargetProvider = ({ children }: PropsWithChildren<object>) => {
  const timestampResult = useTimestamp();
  const { controllerAddress } = useConfig();
  const { chainId } = useConfig();

  const { data: newTarget } = useContractRead({
    // read won't run until address is defined, using this as a pause mechanism
    // to wait for us to have the block height
    address: timestampResult ? (controllerAddress as `0x${string}`) : undefined,
    abi: newTargetAbi,
    functionName: "newTarget",
    overrides: {
      blockTag: timestampResult?.blockNumber,
    },
    chainId,
  } as const);

  const { data: yesterdayTarget } = useContractRead({
    // read won't run until address is defined, using this as a pause mechanism
    // to wait for us to have the block height
    address: timestampResult ? (controllerAddress as `0x${string}`) : undefined,
    abi: newTargetAbi,
    functionName: "newTarget",
    overrides: {
      blockTag: timestampResult?.blockNumber
        ? timestampResult.blockNumber - BLOCKS_IN_A_DAY
        : undefined,
    },
    chainId,
  } as const);

  const [result, setResult] = useState<TargetLookup>({});

  useEffect(() => {
    const newValue: TargetLookup = {};
    if (timestampResult?.timestamp && newTarget) {
      newValue.now = {
        target: newTarget,
        timestamp: timestampResult.timestamp,
      };
    }
    if (timestampResult?.timestamp && yesterdayTarget) {
      newValue.yesterday = {
        target: yesterdayTarget,
        timestamp: timestampResult.timestamp - BLOCKS_IN_A_DAY * 12,
      };
    }
    setResult((prev) => ({
      now: newValue.now ?? prev.now,
      yesterday: newValue.yesterday ?? prev.yesterday,
    }));
  }, [newTarget, timestampResult, yesterdayTarget]);

  return (
    <TargetContext.Provider value={result}>{children}</TargetContext.Provider>
  );
};

export function useTarget(when: "now" | "yesterday" = "now") {
  return useContext(TargetContext)[when];
}
