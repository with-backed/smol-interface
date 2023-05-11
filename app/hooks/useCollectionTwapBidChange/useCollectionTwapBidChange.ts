import { useMemo } from "react";
import { useQuery } from "urql";
import { graphql } from "~/gql/twabs";
import { useConfig } from "../useConfig";
import { useOracleInfo } from "../useOracleInfo";
import { OraclePriceType } from "~/lib/reservoir";

graphql(`
  fragment allTwabsProperties on twabs {
    price
    token_address
    created_at
  }
`);

const latestTwabForCollectionBeforeTime = graphql(`
  query latestTwabForCollectionBeforeTime(
    $collection: bpchar
    $earlierThan: timestamptz
  ) {
    twabs(
      limit: 1
      order_by: { created_at: desc }
      where: {
        token_address: { _eq: $collection }
        created_at: { _lt: $earlierThan }
      }
    ) {
      ...allTwabsProperties
    }
  }
`);

export function useCollectionTwapBidChange(collection: string) {
  const { twabsApi } = useConfig();

  const twentyFourHoursAgo = useMemo(() => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(
      (now.getTime() / 1000 - 24 * 60 * 60) * 1000
    ).toISOString();
    return twentyFourHoursAgo;
  }, []);

  const oracleInfo = useOracleInfo(OraclePriceType.twap);

  const [{ data: twabData }] = useQuery({
    query: latestTwabForCollectionBeforeTime,
    variables: {
      collection: collection.toLowerCase(),
      earlierThan: twentyFourHoursAgo,
    },
    context: useMemo(
      () => ({
        url: twabsApi,
        fetchOptions: {
          headers: {
            "content-type": "application/json",
            "x-hasura-admin-secret": process.env.HASURA_ADMIN_KEY!,
          },
          method: "POST",
        },
      }),
      [twabsApi]
    ),
  });

  const currentPriceForCollection = useMemo(() => {
    if (!oracleInfo || !oracleInfo[collection]) return null;
    return oracleInfo[collection].price;
  }, [oracleInfo, collection]);
  const price24hrAgo = useMemo(() => {
    if (!twabData) return null;
    const latest = twabData.twabs[0];
    return latest ? latest.price : null;
  }, [twabData]);

  const twapPriceChange = useMemo(() => {
    if (!currentPriceForCollection || !price24hrAgo) return null;
    return percentChange(price24hrAgo, currentPriceForCollection);
  }, [currentPriceForCollection, price24hrAgo]);

  return {
    currentPriceForCollection,
    price24hrAgo,
    twapPriceChange,
  };
}

function percentChange(v1: number, v2: number) {
  return (v2 - v1) / v1;
}
