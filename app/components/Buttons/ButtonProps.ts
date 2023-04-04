import type { ButtonHTMLAttributes } from "react";

export default interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  placeholderToSatisfyLinter?: boolean;
}
