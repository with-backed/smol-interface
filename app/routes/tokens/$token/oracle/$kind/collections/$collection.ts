import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { SupportedToken } from "~/lib/config";
import { configs } from "~/lib/config";
import type { OraclePriceType } from "~/lib/reservoir";
import { getSignedOracleFloorPriceMessage } from "~/lib/reservoir";

export async function loader({ params }: LoaderArgs) {
  const { token, collection, kind } = params as {
    token: SupportedToken;
    collection: string;
    kind: OraclePriceType;
  };
  return json(
    await getSignedOracleFloorPriceMessage(collection, configs[token], kind)
  );
}
