import { TransactionButton } from "~/components/Buttons/TransactionButton";
import { usePaprController } from "~/hooks/usePaprController";
import { useNFTSymbol } from "~/hooks/useNFTSymbol";
import { useEffect, useState } from "react";
import type { Address } from "wagmi";
import {
  erc721ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import type { ButtonTheme } from "~/components/Buttons/Button";
import { pirsch } from "~/lib/pirsch";

type ApproveNFTButtonProps = {
  theme: ButtonTheme;
  collateralContractAddress: string;
  setApproved: (val: boolean) => void;
};

export function ApproveNFTButton({
  theme,
  collateralContractAddress,
  setApproved,
}: ApproveNFTButtonProps) {
  const paprController = usePaprController();
  const { address } = useAccount();
  const [approvedLoading, setApprovedLoading] = useState<boolean>(true);
  const [alreadyApproved, setAlreadyApproved] = useState<boolean>(false);

  const { data: isApproved } = useContractRead({
    abi: erc721ABI,
    address: collateralContractAddress as Address,
    functionName: "isApprovedForAll",
    args: [address as Address, paprController.id as Address],
  });

  useEffect(() => {
    if (isApproved === undefined) return;
    setApproved(isApproved);
    setAlreadyApproved(isApproved);
    setApprovedLoading(false);
  }, [isApproved, setApproved]);

  const symbol = useNFTSymbol(collateralContractAddress);

  const { config } = usePrepareContractWrite({
    address: collateralContractAddress as `0x${string}`,
    abi: erc721ABI,
    functionName: "setApprovalForAll",
    args: [paprController.id as `0x${string}`, true],
  });
  const { data, write, error } = useContractWrite({
    ...config,
    onSuccess: (data: any) => {
      data.wait().then(() => {
        pirsch("Approved NFT", { meta: { collateralContractAddress } });
        setApproved(true);
      });
    },
    onError: (e) => {
      pirsch("NFT approval failed", {
        meta: { collateralContractAddress, message: e.message },
      });
    },
  });

  if (alreadyApproved) {
    return <></>;
  }

  return (
    <TransactionButton
      theme={theme}
      onClick={write!}
      transactionData={data}
      error={error?.message}
      disabled={approvedLoading}
      text={symbol ? `Approve ${symbol}` : "..."}
    />
  );
}
