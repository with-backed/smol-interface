import useResizeObserver from "@react-hook/resize-observer";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { MessageBox } from "./MessageBox";
import { Button } from "reakit/Button";
import { useExplainerStore } from "~/lib/explainerStore";

export function LavaExplainer() {
  const setActiveExplainer = useExplainerStore((s) => s.setActiveExplainer);
  const handleClick = useCallback(() => {
    setActiveExplainer(null);
  }, [setActiveExplainer]);
  return (
    <Button
      as="div"
      onClick={handleClick}
      className="explainer bg-white flex relative"
    >
      <div className="bg-[url('/scale/yaxis.svg')] w-2.5 bg-repeat-y bg-[center_top] flex flex-col justify-end">
        <div className="flex flex-col h-2/4">
          <div className="w-full bg-yikes h-16 rounded-lg"></div>
          <div className="w-full bg-risky h-16 rounded-lg"></div>
          <div className="w-full bg-fine flex-1 rounded-t-lg"></div>
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
      </div>
    </Button>
  );
}

export function ValueExplainer() {
  const setActiveExplainer = useExplainerStore((s) => s.setActiveExplainer);
  const handleClick = useCallback(() => {
    setActiveExplainer(null);
  }, [setActiveExplainer]);
  const [nftValueTop, setNFTValueTop] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const positionNFTValue = useCallback(() => {
    if (ref.current) {
      const height = ref.current.getBoundingClientRect().height;
      const top = height / 2;
      setNFTValueTop(top + 16);
    }
  }, []);

  const plankStyle = useMemo(
    () =>
      nftValueTop ? { top: `${nftValueTop - 40}px` } : { display: "none" },
    [nftValueTop]
  );

  useLayoutEffect(() => positionNFTValue(), [positionNFTValue]);
  useResizeObserver(
    (ref.current || null) as HTMLElement | null,
    positionNFTValue
  );

  return (
    <Button
      as="div"
      onClick={handleClick}
      ref={ref}
      className="explainer bg-white flex relative"
    >
      <div className="bg-[url('/scale/yaxis.svg')] w-2.5 bg-repeat-y bg-[center_top] flex flex-col justify-end">
        <MessageBox color="black" top={nftValueTop}>
          NFT Value
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
      </div>
    </Button>
  );
}