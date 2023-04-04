import { ConnectWallet } from "~/components/Buttons/ConnectWallet";

export function Header() {
  return (
    <header className="flex justify-center items-center bg-black text-white">
      <ConnectWallet />
    </header>
  );
}
