import { configs, type SupportedToken } from "~/lib/config";

export function useConfig() {
  return configs[
    typeof window === "undefined"
      ? (process.env.TOKEN as SupportedToken)
      : window.ENV.TOKEN
  ];
}
