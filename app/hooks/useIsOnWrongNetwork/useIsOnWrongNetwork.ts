import { useNetwork } from "wagmi";
import { useConfig } from "~/hooks/useConfig";

export function useIsOnWrongNetwork() {
  const { chainId } = useConfig();
  const { chain } = useNetwork();

  return !!chain?.id && chain?.id !== chainId;
}
