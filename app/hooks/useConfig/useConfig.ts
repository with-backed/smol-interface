import { configs } from "~/lib/config";

export function useConfig() {
  return configs[window.ENV.TOKEN];
}
