import type { BigNumberish, BytesLike } from "ethers";
import { ethers } from "ethers";
import type { Config } from "~/lib/config";

type MessageStruct = {
  id: BytesLike;
  payload: BytesLike;
  timestamp: BigNumberish;
  signature: BytesLike;
};

type SigStruct = { v: BigNumberish; r: BytesLike; s: BytesLike };

export type OracleInfoStruct = {
  message: MessageStruct;
  sig: SigStruct;
};

export enum OraclePriceType {
  spot = "spot",
  twap = "twap",
  lower = "lower",
  upper = "upper",
}

export type ReservoirResponseData = {
  price: number;
  message: {
    id: string;
    payload: string;
    timestamp: number;
    signature: string;
  };
  data: string;
};

export const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 3600;
export const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 3600;

export async function getSignedOracleFloorPriceMessage(
  collection: string,
  config: Config,
  kind: OraclePriceType
): Promise<ReservoirResponseData | null> {
  let reservoirRes: Response;
  try {
    reservoirRes = await fetch(
      `${config.reservoirAPI}/oracle/collections/top-bid/v2?collection=${collection}&kind=${kind}&currency=${config.underlyingAddress}&twapSeconds=${SEVEN_DAYS_IN_SECONDS}`,
      {
        headers: {
          "x-api-key": process.env.RESERVOIR_KEY!,
        },
      }
    );
    const json = await reservoirRes.json();
    return json;
  } catch (e) {
    return null;
  }
}

export function getOraclePayloadFromReservoirObject(
  oracleFromReservoir: ReservoirResponseData | undefined
): OracleInfoStruct {
  // on initial page load, reservoir data is undefined -- return empty contract structs if so
  if (!oracleFromReservoir)
    return {
      message: {
        id: "",
        payload: "",
        signature: "",
        timestamp: "",
      },
      sig: {
        v: "",
        r: "",
        s: "",
      },
    };
  const { v, r, s } = ethers.utils.splitSignature(
    oracleFromReservoir.message.signature
  );

  const oraclePayload: OracleInfoStruct = {
    message: {
      id: oracleFromReservoir.message.id,
      payload: oracleFromReservoir.message.payload,
      signature: oracleFromReservoir.message.signature,
      timestamp: oracleFromReservoir.message.timestamp,
    },
    sig: {
      v,
      r,
      s,
    },
  };

  return oraclePayload;
}
