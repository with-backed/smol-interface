import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TextButton } from "../TextButton";

export function ConnectWallet() {
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

              if (chain.unsupported) {
                return (
                  <TextButton onClick={openChainModal} type="button">
                    Wrong network
                  </TextButton>
                );
              }

              return (
                <TextButton onClick={openAccountModal} type="button">
                  Connected: {account.displayName}
                </TextButton>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
