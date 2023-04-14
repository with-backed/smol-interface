import type { SupportedToken } from "~/lib/config";
import { configs } from "~/lib/config";

export function useConfig() {
  return configs[
    (typeof window === "undefined"
      ? process.env.TOKEN
      : window.ENV.TOKEN) as SupportedToken
  ];
}
