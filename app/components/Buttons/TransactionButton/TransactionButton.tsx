import { useCallback, useEffect, useMemo, useState } from "react";
import type { SendTransactionResult } from "@wagmi/core";
import { EtherscanTransactionLink } from "~/components/EtherscanLink";

import { Button } from "~/components/Buttons/Button";
import type { ButtonProps } from "~/components/Buttons/Button";

interface TransactionButtonProps extends ButtonProps {
  text: string;
  transactionData?: SendTransactionResult;
  disabled?: boolean;
  onClick?: () => void;
  // when ordinarily we would show a TransactionButton, but we don't
  // need to (e.g., token already approved in the past)
  completed?: boolean;
  // used to determine if user has denied tx request in their wallet
  error?: string | null;
}

export function TransactionButton({
  text,
  disabled = false,
  onClick,
  type,
  transactionData,
  completed,
  error,
  theme,
  ...props
}: TransactionButtonProps) {
  const [status, setStatus] = useState<
    "ready" | "confirming" | "pending" | "complete" | "fail"
  >("ready");
  useEffect(() => {
    if (transactionData) {
      setStatus("pending");
      transactionData.wait().then((res) => {
        if (res.status) setStatus("complete");
        else setStatus("fail");
      });
    }
  }, [transactionData]);

  useEffect(() => {
    if (error?.startsWith("User rejected request")) setStatus("ready");
  }, [error]);

  const buttonTheme = useMemo(() => {
    if (disabled) return "bg-unclickable-grey";
    return theme;
  }, [disabled, theme]);
  const buttonClassNames = useMemo(() => {
    return [
      status === "confirming" ? "opacity-80" : "",
      disabled ? [`${theme}-faint`, "text-[rgba(0,0,0,0.3)]"] : "",
    ].flat();
  }, [status, theme, disabled]);

  const onClickWithConfirm = useCallback(() => {
    if (!onClick) return;
    setStatus("confirming");
    onClick();
  }, [onClick, setStatus]);

  if (completed) {
    return (
      <Button type={type} theme={theme}>
        Done
      </Button>
    );
  }

  if (status !== "ready" && status !== "confirming") {
    let message: string;
    switch (status) {
      case "pending":
        message = "Pending...";
        break;
      case "complete":
        message = "Success!";
        break;
      case "fail":
        message = "Failed";
        break;
    }
    const transactionLink = transactionData ? (
      <EtherscanTransactionLink transactionHash={transactionData.hash}>
        view tx
      </EtherscanTransactionLink>
    ) : (
      ""
    );
    return (
      <Button type={type} theme={buttonTheme}>
        <span className="inline-block">{text}</span>
        <span className="inline-block text-xs">
          {message} {transactionLink}
        </span>
      </Button>
    );
  }

  return (
    <Button
      onClick={onClickWithConfirm}
      type={type}
      disabled={disabled || status !== "ready"}
      theme={buttonTheme}
      additionalClassNames={buttonClassNames}
      {...props}
    >
      {status === "confirming" && "Confirm in Wallet"}
      {status !== "confirming" && text}
    </Button>
  );
}
