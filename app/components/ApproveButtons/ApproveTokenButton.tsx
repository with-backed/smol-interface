import { TransactionButton } from "~/components/Buttons/TransactionButton";
import { ethers } from "ethers";
import { usePaprController } from "~/hooks/usePaprController";
import { useEffect, useState } from "react";
import {
  Address,
  erc20ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import type { Erc20Token } from "~/gql/graphql";
import type { ButtonTheme } from "~/components/Buttons/Button";

type ApproveTokenButtonProps = {
  theme: ButtonTheme;
  token: Erc20Token;
  spender: string;
  tokenApproved: boolean;
  setTokenApproved: (val: boolean) => void;
};

export function ApproveTokenButton({
  theme,
  token,
  spender,
  tokenApproved,
  setTokenApproved,
}: ApproveTokenButtonProps) {
  const controller = usePaprController();
  const { address } = useAccount();

  const [approvedLoading, setApprovedLoading] = useState<boolean>(true);

  const { data: allowanceData } = useContractRead({
    address: token.id as `0x${string}`,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address as `0x${string}`, spender as `0x${string}`],
  });

  useEffect(() => {
    if (!allowanceData) return;
    if (allowanceData) setApprovedLoading(false);

    if (allowanceData.gt(ethers.BigNumber.from(0))) {
      setTokenApproved(true);
    }
  }, [allowanceData, setTokenApproved]);

  const { config } = usePrepareContractWrite({
    address: token.id as `0x${string}`,
    abi: erc20ABI,
    functionName: "approve",
    args: [spender as Address, ethers.constants.MaxInt256],
  });
  const {
    data: writeData,
    write,
    error,
  } = useContractWrite({
    ...config,
    onSuccess: (data) => {
      data.wait().then(() => {
        // pirsch(`ERC20 ${token.symbol} approved`, {});
        setTokenApproved(true);
      });
    },
    onError: () => {
      // pirsch(`ERC20 ${token.symbol} approval failed`, {});
    },
  });

  if (approvedLoading) return <></>;

  return (
    <TransactionButton
      theme={theme}
      onClick={write!}
      transactionData={writeData}
      error={error?.message}
      text={`Approve ${token.symbol}`}
      completed={tokenApproved}
    />
  );
}
