import useResizeObserver from "@react-hook/resize-observer";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RiskLevel } from "~/lib/globalStore";
import { MessageBox } from "./MessageBox";
import { Button } from "reakit/Button";
import { type Explainer, useExplainerStore } from "~/lib/explainerStore";
import { formatTokenAmount } from "~/lib/numberFormat";
import { usePaprController } from "~/hooks/usePaprController";
import { useSelectedCollectionValue } from "~/hooks/useSelectedCollectionValue";
import { useGlobalStore } from "~/lib/globalStore";
import { useLiquidationTriggerPrice } from "~/hooks/useLiquidationTriggerPrice";
import { useRiskLevel } from "~/hooks/useRiskLevel";

type RektScaleProps = {
  riskLevel: RiskLevel | undefined;
};

export function RektScale({ riskLevel }: RektScaleProps) {
  const hasLoan = useGlobalStore(
    (s) =>
      (!!s.inProgressLoan && !!s.inProgressLoan.amount) ||
      (!!s.selectedVault && !s.inProgressLoan)
  );

  if (hasLoan) {
    return <RektScaleWithLoan riskLevel={riskLevel} />;
  }

  return <RektScaleNoLoan riskLevel={riskLevel} />;
}

function RektScaleWithLoan({ riskLevel = "fine" }: RektScaleProps) {
  const { underlying } = usePaprController();
  const { collateralCount, currentPriceForCollection } =
    useSelectedCollectionValue();

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
  const liquidationTriggerPrice = useLiquidationTriggerPrice();
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
  return (
    <RektScaleBase
      lava={liquidationTriggerPrice || "..."}
      nftValue={nftValue}
      riskLevel={riskLevel}
      percentage={riskLevelResult?.percentage || 0.5}
    />
  );
}

function RektScaleNoLoan({ riskLevel = "fine" }: RektScaleProps) {
  return (
    <RektScaleBase
      lava="lava"
      nftValue="NFT Value"
      riskLevel={riskLevel}
      percentage={0.5}
    />
  );
}

type RektScaleBaseProps = {
  lava: string;
  nftValue: string;
  riskLevel: RiskLevel;
  percentage: number;
};

function RektScaleBase({
  lava,
  nftValue,
  riskLevel,
  percentage,
}: RektScaleBaseProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [riskLevelTop, setRiskLevelTop] = useState<number | null>(null);
  const [nftValueTop, setNFTValueTop] = useState<number | null>(null);
  const positionNFTValue = useCallback(() => {
    if (ref.current) {
      const elem = ref.current.querySelector(`.bg-yikes`);
      const bodyRect = ref.current.closest(".wrapper")?.getBoundingClientRect();

      if (!elem || !bodyRect) {
        console.error("Could not find elements to position NFT value on scale");
        return;
      }

      const elemRect = elem.getBoundingClientRect();
      const offset = elemRect.top - bodyRect.top;
      setNFTValueTop(offset);
    }
  }, []);

  const positionRiskLevel = useCallback(() => {
    if (ref.current) {
      const elem = ref.current.querySelector(`.bg-${riskLevel}`);
      const bodyRect = ref.current.closest(".wrapper")?.getBoundingClientRect();

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

  useLayoutEffect(() => positionRiskLevel(), [positionRiskLevel]);
  useResizeObserver(
    (ref.current || null) as HTMLElement | null,
    positionRiskLevel
  );

  useLayoutEffect(() => positionNFTValue(), [positionNFTValue]);
  useResizeObserver(
    (ref.current || null) as HTMLElement | null,
    positionNFTValue
  );

  return (
    <>
      <div
        ref={ref}
        className="bg-[url('/scale/yaxis.svg')] w-2.5 bg-repeat-y bg-[center_top] flex flex-col justify-end"
      >
        <div className="flex flex-col h-2/4">
          <div className="w-full bg-yikes h-16 rounded-lg"></div>
          <div className="w-full bg-risky h-16 rounded-lg"></div>
          <div className="w-full bg-fine flex-1 rounded-t-lg"></div>
          <MessageBox color="black" top={nftValueTop}>
            {nftValue} <InfoButton explainer="value" />
          </MessageBox>
          <Lava top={riskLevelTop ? riskLevelTop - 40 : null} />
          <MessageBox color="red" top={riskLevelTop}>
            {lava} <InfoButton explainer="lava" />
          </MessageBox>
        </div>
      </div>
    </>
  );
}

type LavaProps = {
  top: number | null;
};

function Lava({ top }: LavaProps) {
  const style = useMemo(
    () => (top !== null ? { top: `${top}px` } : { display: "none" }),
    [top]
  );
  return (
    <div className="absolute flex w-full justify-center" style={style}>
      <img src="/scale/lava.svg" alt="lava" />
    </div>
  );
}

type InfoButtonProps = {
  explainer: Explainer;
};

function InfoButton({ explainer }: InfoButtonProps) {
  const setActiveExplainer = useExplainerStore((s) => s.setActiveExplainer);
  const handleClick = useCallback(() => {
    setActiveExplainer(explainer);
  }, [explainer, setActiveExplainer]);
  return (
    <Button onClick={handleClick}>
      <img src="/scale/question-mark.svg" alt="more info" />
    </Button>
  );
}
