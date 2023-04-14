import { ButtonHTMLAttributes, useMemo } from "react";

export type ButtonBaseTheme = "fine" | "risky" | "rekt";
export type ButtonFaintTheme = `${ButtonBaseTheme}-faint`;
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
        "p-2 rounded-lg w-56 text-base leading-7",
        `bg-${theme}`,
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
