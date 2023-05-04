import type { SupportedToken } from "~/lib/config";
import { configs } from "~/lib/config";
import type { ReservoirResponseData } from "~/lib/reservoir";
import type { OraclePriceType } from "~/lib/reservoir";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { getAddress } from "ethers/lib/utils.js";
import { useConfig } from "../useConfig";

const ORACLE_POLL_INTERVAL = 1200000;

export type OracleInfo = { [key: string]: ReservoirResponseData };
export type OracleInfoRepository = {
  [kind in OraclePriceType]: OracleInfo | undefined;
};

const EMPTY = {
  lower: undefined,
  upper: undefined,
  twap: undefined,
  spot: undefined,
};

export function oracleInfoProxy<T>(obj: { [key: string]: T }) {
  const proxy = new Proxy(obj, {
    get(target, prop) {
      try {
        return target[getAddress(prop as string)];
      } catch (e) {
        return undefined;
      }
    },
  });

  return proxy;
}

type RustOracleServerRes = {
  collection: string;
  lower: ReservoirResponseData;
  twab: ReservoirResponseData;
};
async function getOracleInfoForToken(
  token: SupportedToken
): Promise<RustOracleServerRes[]> {
  const config = configs[token];
  const req = await fetch(
    `${config.rustOracleServer}?controller=${config.controllerAddress}`,
    {
      method: "GET",
    }
  );
  return req.json();
}

export const OracleInfoContext = createContext<{
  oracleInfo: OracleInfoRepository;
}>({ oracleInfo: EMPTY });

export function OracleInfoProvider({ children }: PropsWithChildren<object>) {
  const { tokenName } = useConfig();
  const [oracleInfoRepository, setOracleInfoRepository] =
    useState<OracleInfoRepository>(EMPTY);

  useEffect(() => {
    const setLatestOracleInfo = async () => {
      const oracleInfoRepository = await getOracleInfoForToken(
        tokenName as SupportedToken
      );
      const lower: OracleInfo = oracleInfoRepository.reduce(
        (prev, current) => ({
          ...prev,
          [getAddress(current.collection)]: current.lower,
        }),
        {} as OracleInfo
      );
      const twap: OracleInfo = oracleInfoRepository.reduce(
        (prev, current) => ({
          ...prev,
          [getAddress(current.collection)]: current.twab,
        }),
        {} as OracleInfo
      );
      setOracleInfoRepository({
        lower: oracleInfoProxy(lower),
        twap: oracleInfoProxy(twap),
      } as OracleInfoRepository);
    };
    setLatestOracleInfo();
    const intervalId = setInterval(setLatestOracleInfo, ORACLE_POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [tokenName]);

  return (
    <OracleInfoContext.Provider value={{ oracleInfo: oracleInfoRepository }}>
      {children}
    </OracleInfoContext.Provider>
  );
}

export function useOracleInfo(kind: OraclePriceType) {
  const { oracleInfo } = useContext(OracleInfoContext);

  return oracleInfo[kind];
}
