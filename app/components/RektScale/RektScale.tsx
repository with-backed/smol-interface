import useResizeObserver from "@react-hook/resize-observer";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { type RiskLevel } from "~/lib/globalStore";

type RektScaleProps = {
  riskLevel: RiskLevel | undefined;
};

export function RektScale({ riskLevel }: RektScaleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState<number | null>(null);
  const position = useCallback(() => {
    if (ref.current) {
      const elem = ref.current.querySelector(`.bg-${riskLevel}`);
      if (!elem) return;
      const bodyRect = ref.current.getBoundingClientRect();
      const elemRect = elem.getBoundingClientRect();
      const offset = elemRect.top - bodyRect.top;
      const height = elem.clientHeight;
      console.log({ bodyRect, elemRect, offset, height });
      if (height !== undefined) {
        setTop(offset + Math.floor(height / 2));
      }
    }
  }, [riskLevel]);
  useLayoutEffect(() => position(), [position]);
  useResizeObserver((ref.current || null) as HTMLElement | null, position);

  return (
    <div className="bg-[url('/scale/yaxis.svg')] w-2.5 bg-repeat-y bg-[center_top] flex flex-col justify-end">
      <div ref={ref} className="flex flex-col h-2/4 relative">
        <div className="w-full bg-yikes h-16 rounded-lg"></div>
        <div className="w-full bg-risky h-16 rounded-lg"></div>
        <div className="w-full bg-fine flex-1 rounded-t-lg"></div>
        <MessageBox color="black" top={0}>
          NFT Value
        </MessageBox>
        <MessageBox color="red" top={top}>
          lava
        </MessageBox>
      </div>
    </div>
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
