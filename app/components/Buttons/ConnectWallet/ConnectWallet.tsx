import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useIsOnWrongNetwork } from "~/hooks/useIsOnWrongNetwork";
import { TextButton } from "../TextButton";

export function ConnectWallet() {
  const onWrongNetwork = useIsOnWrongNetwork();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <TextButton onClick={openConnectModal} type="button">
                    Connect Wallet
                  </TextButton>
                );
              }

              if (onWrongNetwork) {
                return (
                  <TextButton onClick={openChainModal} type="button">
                    Wrong network
                  </TextButton>
                );
              }

              return (
                <TextButton onClick={openAccountModal} type="button">
                  {account.displayName}
                </TextButton>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
