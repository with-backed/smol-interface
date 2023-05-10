import { Asset } from "@center-inc/react";
import type { ComponentProps } from "react";

type CenterAssetProps = Exclude<
  ComponentProps<typeof Asset>,
  "renderLoading" | "renderError"
>;

export function CenterAsset(props: CenterAssetProps) {
  return <Asset {...props} renderError={Error} renderLoading={Loading} />;
}

function Loading() {
  return <img src="/loading-ellipses.svg" alt="loading ellipses" />;
}

function Error() {
  return <div className="center-error"></div>;
}
