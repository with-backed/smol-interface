import type { ButtonHTMLAttributes } from "react";
import { useMemo } from "react";

export type ButtonBaseTheme =
  | "bg-fine"
  | "bg-risky"
  | "bg-yikes"
  | "bg-unclickable-grey"
  | "bg-completed-grey"
  | "bg-black";
export type ButtonFaintTheme =
  | "bg-fine-faint"
  | "bg-risky-faint"
  | "bg-yikes-faint";
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
        `p-2 rounded-lg w-56 text-base leading-7 ${theme}`,
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
