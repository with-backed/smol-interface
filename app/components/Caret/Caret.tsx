type CaretProps = {
  orientation?: "up" | "down";
};

export const Caret = ({ orientation = "down" }: CaretProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={30}
    height={30}
    fill="none"
    className={orientation === "down" ? "" : "rotate-180"}
  >
    <rect width={30} height={30} fill="#404040" rx={10} />
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M8.636 13 15 19.364 21.364 13"
    />
  </svg>
);
