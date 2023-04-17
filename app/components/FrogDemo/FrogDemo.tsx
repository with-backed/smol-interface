import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useResizeObserver from "@react-hook/resize-observer";

const LOOK = "👀";
const THINK = "🤔";

export function FrogDemo() {
  const [thinkValue, setThinkValue] = useState(0);
  const handleThinkChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setThinkValue(parseInt(e.target.value));
    },
    []
  );

  const [lookValue, setLookValue] = useState(0);
  const handleLookChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLookValue(parseInt(e.target.value));
    },
    []
  );

  return (
    <div className="flex flex-col h-full">
      <div>
        <Input id="think" handleChange={handleThinkChange} value={thinkValue}>
          {THINK}
        </Input>
        <Input id="look" handleChange={handleLookChange} value={lookValue}>
          {LOOK}
        </Input>
      </div>
      <div className="pointer-wrapper flex flex-col relative my-auto">
        <div className="flex">
          <div className="w-2 h-12 bg-rekt rounded-lg"></div>
        </div>
        <div className="flex">
          <div className="w-2 h-12 bg-risky rounded-lg"></div>
        </div>
        <div className="flex">
          <div className="w-2 h-24 bg-fine rounded-lg"></div>
        </div>
        <Pointer percentagePoints={thinkValue}>{THINK}</Pointer>
        <Pointer percentagePoints={lookValue}>{LOOK}</Pointer>
      </div>
    </div>
  );
}

type PointerProps = React.PropsWithChildren & {
  percentagePoints: number;
};
function Pointer({ children, percentagePoints }: PointerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState<number | null>(null);
  const style = useMemo(
    () => (top !== null ? { top } : { display: "none" }),
    [top]
  );

  const position = useCallback(() => {
    if (ref.current) {
      const parent = ref.current.closest(`.pointer-wrapper`);
      const parentHeight = parent?.clientHeight;
      if (parentHeight !== undefined) {
        setTop(xPercentOfHeight(parentHeight, percentagePoints));
      }
    }
  }, [percentagePoints]);

  useLayoutEffect(() => position(), [position]);
  useResizeObserver(
    (ref.current?.closest(`.pointer-wrapper`) || null) as HTMLElement | null,
    position
  );

  return (
    <div ref={ref} className="absolute -translate-y-2" style={style}>
      <span>{children}</span>
    </div>
  );
}

type InputProps = React.PropsWithChildren & {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: number;
  id: string;
};

function Input({ children, handleChange, id, value }: InputProps) {
  return (
    <div>
      <input
        id={id}
        type="range"
        onChange={handleChange}
        min={0}
        max={100}
        step={1}
        value={value}
      ></input>
      <label htmlFor={id}>
        {children} ({value}%)
      </label>
    </div>
  );
}

function xPercentOfHeight(height: number, percentagePoints: number) {
  const ratio = percentagePoints / 100;
  // flipping because we are positioning from top, not bottom
  const flippedRatio = 1 - ratio;
  return flippedRatio * height;
}
