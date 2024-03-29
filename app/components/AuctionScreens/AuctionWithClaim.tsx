import { useMemo, useState } from "react";
import { usePaprController } from "~/hooks/usePaprController";
import type { VaultWithRiskLevel } from "~/lib/globalStore";
import { useGlobalStore } from "~/lib/globalStore";
import { TransactionButton } from "../Buttons/TransactionButton";
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { formatBigNum } from "~/lib/numberFormat";
import { ApproveTokenButton } from "../ApproveButtons";
import { swapRouterABI, swapRouterAddress } from "types/generatedABI";
import { usePoolQuote } from "~/hooks/usePoolQuote";
import { ethers } from "ethers";
import { getCurrentUnixTime } from "~/lib/duration";
import { FEE_TIER } from "~/lib/constants";
import { useLoan } from "~/hooks/useLoan";

type AuctionWithClaimProps = {
  vault: NonNullable<VaultWithRiskLevel>;
};
export function AuctionWithClaim({ vault }: AuctionWithClaimProps) {
  const { address } = useAccount();
  const { paprToken, underlying } = usePaprController();

  const loanDetails = useLoan(vault);
  const mostRecentAuction = useMemo(() => {
    return vault.pastAuctions.sort(
      (a, b) => b.end!.timestamp - a.end!.timestamp
    )[0];
  }, [vault.pastAuctions]);

  const { data: claimableAmount } = useContractRead({
    address: paprToken.id as `0x${string}`,
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  const [paprTokenApproved, setPaprTokenApproved] = useState(false);
  const hasClaimed = useGlobalStore(
    (s) => s.recentActions[vault.token.id]?.hasClaimed || false
  );
  const setRecentActions = useGlobalStore((s) => s.setRecentActions);

  const quoteForClaimable = usePoolQuote({
    amount: claimableAmount || null,
    inputToken: paprToken.id,
    outputToken: underlying.id,
    tradeType: "exactIn",
    skip: !claimableAmount,
  });

  const formattedClaimable = useMemo(() => {
    if (!quoteForClaimable) return "...";
    return `${formatBigNum(quoteForClaimable, underlying.decimals, 4)} ${
      underlying.symbol
    }`;
  }, [quoteForClaimable, underlying.decimals, underlying.symbol]);

  const { config } = usePrepareContractWrite({
    address:
      quoteForClaimable && claimableAmount ? swapRouterAddress[1] : undefined,
    abi: swapRouterABI,
    functionName: "exactInputSingle",
    args: [
      {
        amountIn: claimableAmount || ethers.BigNumber.from(0),
        amountOutMinimum: quoteForClaimable || ethers.BigNumber.from(0),
        sqrtPriceLimitX96: ethers.BigNumber.from(0),
        tokenIn: paprToken.id as `0x${string}`,
        tokenOut: underlying.id as `0x${string}`,
        fee: FEE_TIER,
        recipient: address as `0x${string}`,
        deadline: getCurrentUnixTime().add(30 * 60),
      },
    ],
  });

  const { data, write, error } = useContractWrite({
    ...config,
    onSuccess: () => {
      setRecentActions((actions) => ({
        ...actions,
        [vault.token.id]: {
          hasClaimed: true,
          hasRepaid: false,
        },
      }));
    },
  });

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-initial flex flex-col p-6">
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Borrowed:</p>
          </div>
          <div>
            <p>{loanDetails.formattedBorrowed}</p>
          </div>
        </div>
        <div className="flex flex-row justify-between py-1">
          <div>
            <p>Claimable proceeds:</p>
          </div>
          <div>
            <p>{formattedClaimable}</p>
          </div>
        </div>
      </div>
      {!hasClaimed && (
        <>
          <div className="py-4 px-6">
            <p>
              You waited too long and tokenID {mostRecentAuction.auctionAssetID}{" "}
              was sold at a liquidation auction! The excess has been credited to
              you in paprMEME, click here to swap it for ETH.
            </p>
          </div>
          <div className="graph-papr flex flex-col justify-center items-center py-16 mt-auto">
            {!paprTokenApproved && (
              <div className="my-2">
                <ApproveTokenButton
                  token={paprToken}
                  spender={swapRouterAddress[1]}
                  minApprovalRequired={claimableAmount || null}
                  theme="bg-black"
                  tokenApproved={paprTokenApproved}
                  setTokenApproved={setPaprTokenApproved}
                />
              </div>
            )}
            <div className="my-2">
              <TransactionButton
                text={formattedClaimable}
                theme={"bg-black"}
                onClick={write!}
                transactionData={data}
                disabled={!paprTokenApproved}
                error={error?.message}
              />
            </div>
          </div>
        </>
      )}
      {hasClaimed && (
        <div className="my-8 flex flex-col items-center">
          <img src="/5-RIP-dance.svg" alt="rip dance" />
          <p className="my-2 text-center">sorry for ur loss</p>
        </div>
      )}
    </div>
  );
}
