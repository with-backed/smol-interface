import type { SupportedToken } from "~/lib/config";
import { getTokenFromEnv } from "~/lib/config";
import type { ReservoirResponseData } from "~/lib/reservoir";
import { OraclePriceType } from "~/lib/reservoir";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getAddress } from "ethers/lib/utils.js";

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

async function getOracleInfoFromAllowedCollateral(
  collections: string[],
  token: SupportedToken,
  kind: OraclePriceType = OraclePriceType.lower
) {
  const oracleInfoFromAPI: ReservoirResponseData[] = await Promise.all(
    collections.map(async (collectionAddress) => {
      const req = await fetch(
        `/tokens/${token}/oracle/${kind}/collections/${collectionAddress}`,
        {
          method: "GET",
        }
      );
      return req.json();
    })
  );
  const oracleInfo = collections.reduce(
    (prev, current, i) => ({
      ...prev,
      [getAddress(current)]: oracleInfoFromAPI[i] as ReservoirResponseData,
    }),
    {} as OracleInfo
  );
  return oracleInfo;
}

export const OracleInfoContext = createContext<{
  oracleInfo: OracleInfoRepository;
  register: (kind: OraclePriceType) => void;
}>({ oracleInfo: EMPTY, register: (_kind: OraclePriceType) => null });

export function OracleInfoProvider({
  collections,
  children,
}: PropsWithChildren<{ collections: string[] }>) {
  const tokenName = getTokenFromEnv();
  const [registeredKinds, setRegisteredKinds] = useState<OraclePriceType[]>([]);
  const [oracleInfoRepository, setOracleInfoRepository] =
    useState<OracleInfoRepository>(EMPTY);

  const register = useCallback(
    async (kind: OraclePriceType) => {
      if (!registeredKinds.includes(kind)) {
        setRegisteredKinds((prev) => [...prev, kind]);
      }
    },
    [registeredKinds]
  );

  useEffect(() => {
    const setLatestOracleInfo = async () => {
      const oracleInfoForKinds = await Promise.all(
        registeredKinds.map(
          async (kind) =>
            await getOracleInfoFromAllowedCollateral(
              collections,
              tokenName as SupportedToken,
              kind
            )
        )
      );
      const newOracleInfoRepository = registeredKinds.reduce(
        (prevRepo, nextKind, i) => ({
          ...prevRepo,
          [nextKind]: oracleInfoForKinds[i],
        }),
        {}
      );
      setOracleInfoRepository(newOracleInfoRepository as OracleInfoRepository);
    };
    setLatestOracleInfo();
    const intervalId = setInterval(setLatestOracleInfo, ORACLE_POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [tokenName, collections, registeredKinds]);

  return (
    <OracleInfoContext.Provider
      value={{ oracleInfo: oracleInfoRepository, register }}
    >
      {children}
    </OracleInfoContext.Provider>
  );
}

export function useOracleInfo(kind: OraclePriceType) {
  const { oracleInfo, register } = useContext(OracleInfoContext);
  register(kind);

  return oracleInfo[kind];
}
