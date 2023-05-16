import useResizeObserver from "@react-hook/resize-observer";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MessageBox } from "./MessageBox";
import { useExplainerStore } from "~/lib/explainerStore";
import { useSelectedCollectionValue } from "~/hooks/useSelectedCollectionValue";
import { formatPercent, formatTokenAmount } from "~/lib/numberFormat";
import { usePaprController } from "~/hooks/usePaprController";
import { useLiquidationTriggerPrice } from "~/hooks/useLiquidationTriggerPrice";
import { useGlobalStore } from "~/lib/globalStore";
import { TextButton } from "../Buttons/TextButton";
import { useCollectionTwapBidChange } from "~/hooks/useCollectionTwapBidChange";
import { useRiskLevel } from "~/hooks/useRiskLevel";
import { percentChange } from "~/lib/utils";

export function LavaExplainer() {
  const hasLoan = useGlobalStore(
    (s) => !!s.inProgressLoan || !!s.selectedVault
  );

  if (hasLoan) {
    return <LavaExplainerWithLoan />;
  }

  return <LavaExplainerNoLoan />;
}

function LavaExplainerWithLoan() {
  const { formattedLiquidationTriggerPrice, amount: amountToday } =
    useLiquidationTriggerPrice();
  const { amount: amountYesterday } = useLiquidationTriggerPrice("yesterday");
  const selectedVault = useGlobalStore((s) => s.selectedVault);
  const inProgressLoan = useGlobalStore((s) => s.inProgressLoan);
  const loanSpec = useMemo(() => {
    if (inProgressLoan) {
      const collateralAddress = inProgressLoan.collectionAddress;
      const collateralCount = inProgressLoan.tokenIds.length;
      // We check for this in "hasLoan"
      const debt = inProgressLoan.amount!;
      return {
        collateralAddress,
        collateralCount,
        debt,
      };
    }
    // We check for this in "hasLoan", if inProgressLoan is null, selectedVault is not
    const v = selectedVault!;
    return {
      collateralAddress: v.token.id,
      collateralCount: v.collateral.length,
      debt: v.debt,
    };
  }, [inProgressLoan, selectedVault]);
  const riskLevelResult = useRiskLevel(loanSpec);
  const changePercentage = useMemo(() => {
    if (!amountToday || !amountYesterday || !riskLevelResult?.percentage) {
      return null;
    }
    return percentChange(amountYesterday, amountToday);
  }, [amountToday, amountYesterday, riskLevelResult]);
  console.log({ amountToday, amountYesterday });
  return (
    <LavaExplainerBase
      liquidationTriggerPrice={formattedLiquidationTriggerPrice || "..."}
      percentage={riskLevelResult?.percentage || 0.5}
      changePercentage={changePercentage}
    />
  );
}

function LavaExplainerNoLoan() {
  return <LavaExplainerBase liquidationTriggerPrice="lava" percentage={0.5} />;
}

type LavaExplainerBaseProps = {
  liquidationTriggerPrice: string;
  percentage: number;
  changePercentage?: number | null;
};
function LavaExplainerBase({
  liquidationTriggerPrice,
  percentage,
  changePercentage = null,
}: LavaExplainerBaseProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [riskLevelTop, setRiskLevelTop] = useState<number | null>(null);
  const setActiveExplainer = useExplainerStore((s) => s.setActiveExplainer);
  const handleClick = useCallback(() => {
    setActiveExplainer(null);
  }, [setActiveExplainer]);
  const riskLevel = useGlobalStore(
    (s) => s.selectedVault?.riskLevel || s.inProgressLoan?.riskLevel || "fine"
  );

  const positionRiskLevel = useCallback(() => {
    if (ref.current) {
      const elem = ref.current.querySelector(`.bg-${riskLevel}`);
      const bodyRect = ref.current
        .closest(".explainer")
        ?.getBoundingClientRect();

      if (!elem || !bodyRect) {
        console.error(
          "Could not find elements to position risk level on scale"
        );
        return;
      }

      const elemRect = elem.getBoundingClientRect();
      const offset = elemRect.top - bodyRect.top;
      const height = elem.clientHeight;
      if (height !== undefined) {
        setRiskLevelTop(offset + Math.floor(height * (1 - percentage)));
      }
    }
  }, [riskLevel, percentage]);

  const percentChangeTop = useMemo(() => {
    if (!changePercentage || !riskLevelTop) {
      return null;
    }
    return Math.floor(riskLevelTop + riskLevelTop * changePercentage);
  }, [changePercentage, riskLevelTop]);

  const percentChangeText = useMemo(() => {
    if (!changePercentage) {
      return null;
    }
    const direction = changePercentage > 0 ? "up" : "down";
    return `Compared to 24 hours ago, it has moved ${direction} ${formatPercent(
      Math.abs(changePercentage)
    )}`;
  }, [changePercentage]);

  useLayoutEffect(() => positionRiskLevel(), [positionRiskLevel]);
  useResizeObserver(
    (ref.current || null) as HTMLElement | null,
    positionRiskLevel
  );

  return (
    <div className="explainer bg-white flex relative" ref={ref}>
      <div className="bg-[url('/scale/yaxis.svg')] w-2.5 bg-repeat-y bg-[center_top] flex flex-col justify-end">
        <div className="flex flex-col h-2/4">
          <div className="w-full bg-yikes h-16 rounded-lg"></div>
          <div className="w-full bg-risky h-16 rounded-lg"></div>
          <div className="w-full bg-fine flex-1 rounded-t-lg"></div>
          <MessageBox color="purple" top={percentChangeTop}>
            24 Hours Ago
          </MessageBox>
          <MessageBox onClick={handleClick} color="red" top={riskLevelTop}>
            {liquidationTriggerPrice}{" "}
            <img src="/scale/question-mark.svg" alt="more info" />
          </MessageBox>
        </div>
      </div>
      <div className="w-9/12 flex flex-col gap-8 mt-12 ml-8">
        <p>
          liquidation happens when the borrowed amount + interest charges grows
          to 50% of the NFT value
        </p>

        <p>
          interest charges go up and down based on demand from lenders and
          borrowers
        </p>

        {!!percentChangeText && (
          <p className="text-[#9831FF]">{percentChangeText}</p>
        )}
        <div className="mt-auto mb-[90px] text-center">
          <TextButton onClick={handleClick}>close</TextButton>
        </div>
      </div>
    </div>
  );
}

export function ValueExplainer() {
  const { underlying, allowedCollateral } = usePaprController();
  const setActiveExplainer = useExplainerStore((s) => s.setActiveExplainer);
  const handleClick = useCallback(() => {
    setActiveExplainer(null);
  }, [setActiveExplainer]);
  const [nftValueTop, setNFTValueTop] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { collateralCount, currentPriceForCollection } =
    useSelectedCollectionValue();
  const collection = useGlobalStore(
    (s) => s.selectedVault?.token.id || s.inProgressLoan?.collectionAddress
  );
  const { twapPriceChange } = useCollectionTwapBidChange(collection || "");

  const positionNFTValue = useCallback(() => {
    if (ref.current) {
      const height = ref.current.getBoundingClientRect().height;
      const top = height / 2;
      setNFTValueTop(top + 16);
    }
  }, []);

  const yesterdayValueTop = useMemo(() => {
    if (!nftValueTop || !twapPriceChange) {
      return null;
    }
    return Math.floor(nftValueTop - nftValueTop * twapPriceChange);
  }, [nftValueTop, twapPriceChange]);

  const nftValue = useMemo(() => {
    if (currentPriceForCollection && collateralCount) {
      return (
        formatTokenAmount(currentPriceForCollection * collateralCount) +
        " " +
        underlying.symbol
      );
    }
    return "NFT Value";
  }, [collateralCount, currentPriceForCollection, underlying]);

  const plankStyle = useMemo(
    () =>
      nftValueTop ? { top: `${nftValueTop - 40}px` } : { display: "none" },
    [nftValueTop]
  );

  const percentChangeText = useMemo(() => {
    if (!twapPriceChange) {
      return null;
    }
    const direction = twapPriceChange > 0 ? "up" : "down";
    return `Compared to 24 hours ago, it has moved ${direction} ${formatPercent(
      Math.abs(twapPriceChange)
    )}`;
  }, [twapPriceChange]);

  useLayoutEffect(() => positionNFTValue(), [positionNFTValue]);
  useResizeObserver(
    (ref.current || null) as HTMLElement | null,
    positionNFTValue
  );

  return (
    <div ref={ref} className="explainer bg-white flex relative">
      <div className="bg-[url('/scale/yaxis.svg')] w-2.5 bg-repeat-y bg-[center_top] flex flex-col justify-end">
        <MessageBox color="purple" top={yesterdayValueTop}>
          24 Hours Ago
        </MessageBox>
        {nftValueTop && (
          <div
            className="absolute w-full flex justify-center"
            style={plankStyle}
          >
            <img src="/scale/plank.svg" alt="" />
          </div>
        )}
        <MessageBox onClick={handleClick} color="black" top={nftValueTop}>
          {nftValue}
          <img src="/scale/question-mark.svg" alt="more info" />
        </MessageBox>
      </div>
      <div className="w-9/12 flex flex-col gap-8 mt-12 ml-8">
        <p>
          NFT value equals the average highest collection bid over the last 7
          days
        </p>

        <p>
          your NFT will be liquidated (auctioned) if this value drops to lava
          level
        </p>
        <div className="mt-auto mb-[90px] flex flex-col gap-2 items-center justify-center">
          {percentChangeText && (
            <p className="text-[#9831FF]">{percentChangeText}</p>
          )}
          <TextButton onClick={handleClick}>close</TextButton>
        </div>
      </div>
    </div>
  );
}
