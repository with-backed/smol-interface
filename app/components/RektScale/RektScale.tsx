import { useMemo } from "react";

export function RektScale() {
  return (
    <div className="bg-[url('/scale/yaxis.svg')] w-2.5 bg-repeat-y bg-[center_top] flex flex-col justify-end">
      <div className="flex flex-col h-2/4 relative">
        <div className="w-full bg-yikes h-16 rounded-lg"></div>
        <div className="w-full bg-risky h-16 rounded-lg"></div>
        <div className="w-full bg-fine flex-1 rounded-t-lg"></div>
        <MessageBox color="black" top={0}>
          henlo
        </MessageBox>
        <MessageBox color="red" top={45}>
          goobdye
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
    top: number;
  }
>;

function MessageBox({ children, color, top }: MessageBoxProps) {
  const className = useMemo(() => {
    const base = `text-white px-2 py-1`;
    if (color === "black") {
      return `${base} bg-black`;
    }
    return `${base} ${RED}`;
  }, [color]);

  // TODO: this is a hack to get the pointer to line up with the text
  const style = useMemo(() => ({ top: `${top - 16}px` }), [top]);

  return (
    <div
      className="absolute flex flex-row justify-center items-center ml-1"
      style={style}
    >
      <Pointer color={color} />
      <div className={className}>{children}</div>
    </div>
  );
}
