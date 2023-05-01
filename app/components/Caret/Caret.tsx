type CaretProps = {
  orientation?: "up" | "down";
  onClick: () => void;
};

export const Caret = ({ orientation = "down", onClick }: CaretProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={30}
    height={30}
    fill="none"
    className={orientation === "down" ? "" : "rotate-180"}
    onClick={onClick}
  >
    <rect width={30} height={30} className="fill-medium-grey" rx={10} />
    <path
      stroke="black"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M8.636 13 15 19.364 21.364 13"
    />
  </svg>
);
