import { TransactionButton } from "~/components/Buttons/TransactionButton";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import type { Address } from "wagmi";
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import type { Erc20Token } from "~/gql/graphql";
import type { ButtonTheme } from "~/components/Buttons/Button";
import { pirsch } from "~/lib/pirsch";

type ApproveTokenButtonProps = {
  theme: ButtonTheme;
  token: Erc20Token;
  spender: string;
  minApprovalRequired: ethers.BigNumber | null;
  tokenApproved: boolean;
  setTokenApproved: (val: boolean) => void;
};

export function ApproveTokenButton({
  theme,
  token,
  spender,
  minApprovalRequired,
  tokenApproved,
  setTokenApproved,
}: ApproveTokenButtonProps) {
  const { address } = useAccount();

  const [approvedLoading, setApprovedLoading] = useState<boolean>(true);

  const { data: allowanceData } = useContractRead({
    address: token.id as `0x${string}`,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address as Address, spender as Address],
  });

  useEffect(() => {
    if (!allowanceData || !minApprovalRequired) return;
    if (allowanceData) setApprovedLoading(false);

    if (allowanceData.gt(minApprovalRequired)) {
      setTokenApproved(true);
    }
  }, [allowanceData, minApprovalRequired, setTokenApproved]);

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
        pirsch("ERC20 approved", {
          meta: { tokenId: token.id, symbol: token.symbol },
        });
        setTokenApproved(true);
      });
    },
    onError: (e) => {
      pirsch("ERC20 approval failed", {
        meta: { tokenId: token.id, symbol: token.symbol, message: e.message },
      });
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
