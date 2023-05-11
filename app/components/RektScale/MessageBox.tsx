import { useMemo } from "react";

const RED = "bg-[#FF3131]";
const PURPLE = "bg-[#9831FF]";
type Colorable = {
  color: "black" | "red" | "purple";
};

type PointerProps = Colorable;

function Pointer({ color }: PointerProps) {
  const className = useMemo(() => {
    if (color === "black") {
      return "left-pointing-triangle bg-black";
    }
    if (color === "purple") {
      return `left-pointing-triangle ${PURPLE}`;
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

export function MessageBox({ children, color, top }: MessageBoxProps) {
  const className = useMemo(() => {
    const base = `text-white px-2 py-1 ml-[-1px] flex justify-center items-center gap-2`;
    if (color === "black") {
      return `${base} bg-black`;
    }
    if (color === "purple") {
      return `${base} ${PURPLE}`;
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
