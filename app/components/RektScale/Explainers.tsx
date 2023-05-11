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
  return <LavaExplainerBase />;
}

function LavaExplainerNoLoan() {
  return <LavaExplainerBase />;
}

function LavaExplainerBase() {
  const ref = useRef<HTMLDivElement>(null);
  const [riskLevelTop, setRiskLevelTop] = useState<number | null>(null);
  const setActiveExplainer = useExplainerStore((s) => s.setActiveExplainer);
  const handleClick = useCallback(() => {
    setActiveExplainer(null);
  }, [setActiveExplainer]);
  const liquidationTriggerPrice = useLiquidationTriggerPrice();
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
        setRiskLevelTop(offset + Math.floor(height / 2));
      }
    }
  }, [riskLevel]);

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
          <MessageBox color="red" top={riskLevelTop}>
            {liquidationTriggerPrice || "lava"}{" "}
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
        <div className="mt-auto mb-[90px] text-center">
          <TextButton onClick={handleClick}>close</TextButton>
        </div>
      </div>
    </div>
  );
}

export function ValueExplainer() {
  const { underlying } = usePaprController();
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
        <MessageBox color="black" top={nftValueTop}>
          {nftValue}
          <img src="/scale/question-mark.svg" alt="more info" />
        </MessageBox>
        {nftValueTop && (
          <div
            className="absolute w-full flex justify-center"
            style={plankStyle}
          >
            <img src="/scale/plank.svg" alt="" />
          </div>
        )}
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
