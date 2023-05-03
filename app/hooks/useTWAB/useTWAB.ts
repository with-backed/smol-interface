import { useMemo } from "react";
import { useQuery } from "urql";
import { graphql } from "~/gql/twabs";

const _allTwabProperties = graphql(`
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

export function useTWAB(collection: string) {
  const now = useMemo(() => new Date(), []);
  const [{ data }] = useQuery({
    query: latestTwabForCollectionBeforeTime,
    variables: {
      earlierThan: now,
    },
  });
  console.log({ data });
  return null;
}
