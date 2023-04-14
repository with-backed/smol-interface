import type { ButtonHTMLAttributes } from "react";
import { useMemo } from "react";

export type ButtonBaseTheme = "bg-fine" | "bg-risky" | "bg-rekt";
export type ButtonFaintTheme =
  | "bg-fine-faint"
  | "bg-risky-faint"
  | "bg-rekt-faint";
export type ButtonTheme = ButtonBaseTheme | ButtonFaintTheme;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: ButtonTheme;
  additionalClassNames?: string[];
}

export function Button({
  children,
  theme,
  additionalClassNames = [],
  ...props
}: ButtonProps) {
  const className = useMemo(
    () =>
      [
        `p-2 rounded-lg w-56 text-base leading-7 ${theme}`,
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
