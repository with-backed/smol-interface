import type ButtonProps from "~/components/Buttons/ButtonProps";

export function TextButton({ children, ...props }: ButtonProps) {
  return (
    <button {...props} className="underline">
      {children}
    </button>
  );
}
