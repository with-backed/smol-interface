import React, { useCallback, useEffect, useRef, useState } from "react";

const LOOK = "👀";
const THINK = "🤔";

export function FrogDemo() {
  const [componentHeight, setComponentHeight] = useState(0);
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

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      // A production quality implementation would use ResizeObserver
      // to measure the height after the window resizes in case anything changes.
      const height = ref.current.clientHeight;
      setComponentHeight(height);
    }
  });

  console.log({ componentHeight });

  return (
    <>
      <Input id="think" handleChange={handleThinkChange} value={thinkValue}>
        {THINK}
      </Input>
      <Input id="look" handleChange={handleLookChange} value={lookValue}>
        {LOOK}
      </Input>
      <div ref={ref} className="flex flex-col relative">
        <div className="flex">
          <div className="w-2 h-12 bg-rekt rounded-lg"></div>
        </div>
        <div className="flex">
          <div className="w-2 h-12 bg-risky rounded-lg"></div>
        </div>
        <div className="flex">
          <div className="w-2 h-24 bg-fine rounded-lg"></div>
        </div>
        <Pointer bottom={xPercentOfHeight(componentHeight, thinkValue)}>
          {THINK}
        </Pointer>
        <Pointer bottom={xPercentOfHeight(componentHeight, lookValue)}>
          {LOOK}
        </Pointer>
      </div>
    </>
  );
}

type PointerProps = React.PropsWithChildren & {
  bottom: number;
};
function Pointer({ children, bottom }: PointerProps) {
  return (
    <div className="absolute -translate-y-2" style={{ top: bottom }}>
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
