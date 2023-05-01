import useResizeObserver from "@react-hook/resize-observer";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { type RiskLevel } from "~/lib/globalStore";

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
            NFT Value
          </MessageBox>
          <Lava top={riskLevelTop ? riskLevelTop - 40 : null} />
          <MessageBox color="red" top={riskLevelTop}>
            lava
          </MessageBox>
        </div>
      </div>
    </>
  );
}

const RED = "bg-[#FF3131]";
type Colorable = {
  color: "black" | "red";
};

type PointerProps = Colorable;

function Pointer({ color }: PointerProps) {
  const className = useMemo(() => {
    if (color === "black") {
      return "left-pointing-triangle bg-black";
    }
    return `left-pointing-triangle ${RED}`;
  }, [color]);
  return <div className={className} />;
}

type MessageBoxProps = React.PropsWithChildren<
  Colorable & {
    top: number | null;
  }
>;

function MessageBox({ children, color, top }: MessageBoxProps) {
  const className = useMemo(() => {
    const base = `text-white px-2 py-1 ml-[-1px]`;
    if (color === "black") {
      return `${base} bg-black`;
    }
    return `${base} ${RED}`;
  }, [color]);

  // TODO: this is a hack to get the pointer to line up with the text
  const style = useMemo(
    () => (top !== null ? { top: `${top - 16}px` } : { display: "none" }),
    [top]
  );

  return (
    <div
      className="absolute flex flex-row justify-center items-center ml-1 whitespace-nowrap"
      style={style}
    >
      <Pointer color={color} />
      <div className={className}>{children}</div>
    </div>
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
