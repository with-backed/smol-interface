import useResizeObserver from "@react-hook/resize-observer";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGlobalStore } from "~/lib/globalStore";
import type { Explainer, RiskLevel } from "~/lib/globalStore";
import { MessageBox } from "./MessageBox";
import { Button } from "reakit/Button";

type RektScaleProps = {
  riskLevel: RiskLevel | undefined;
};

export function RektScale({ riskLevel }: RektScaleProps) {
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
        setRiskLevelTop(offset + Math.floor(height / 2));
      }
    }
  }, [riskLevel]);

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
            NFT Value <InfoButton explainer="value" />
          </MessageBox>
          <Lava top={riskLevelTop ? riskLevelTop - 40 : null} />
          <MessageBox color="red" top={riskLevelTop}>
            lava <InfoButton explainer="lava" />
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
  const setActiveExplainer = useGlobalStore((s) => s.setActiveExplainer);
  const handleClick = useCallback(() => {
    setActiveExplainer(explainer);
  }, [explainer, setActiveExplainer]);
  return (
    <Button onClick={handleClick}>
      <img src="/scale/question-mark.svg" alt="more info" />
    </Button>
  );
}
