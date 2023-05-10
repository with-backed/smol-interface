import type { ButtonHTMLAttributes } from "react";
import { useMemo } from "react";

export type ButtonBaseTheme =
  | "bg-fine"
  | "bg-risky"
  | "bg-yikes"
  | "bg-black"
  | "bg-completed-grey"
  | "bg-unclickable-grey";
export type ButtonFaintTheme =
  | "bg-fine-faint"
  | "bg-risky-faint"
  | "bg-yikes-faint"
  | "bg-black-faint";
export type ButtonTheme = ButtonBaseTheme | ButtonFaintTheme;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: ButtonTheme;
  additionalClassNames?: string[];
}

export function Button({
  children,
  theme = "bg-fine",
  additionalClassNames = [],
  ...props
}: ButtonProps) {
  const className = useMemo(
    () =>
      [
        `py-2 px-4 flex flex-col items-center rounded-lg text-base leading-7 ${theme}`,
        `${theme === "bg-black" ? "text-white" : ""}`,
        ...additionalClassNames,
      ].join(" "),
    [theme, additionalClassNames]
  );

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
