import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { cacheExchange, createClient, fetchExchange } from "@urql/core";
import { graphql } from "~/gql/twabs";
import type { SupportedToken } from "~/lib/config";
import { configs } from "~/lib/config";

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

export async function loader({ params }: LoaderArgs) {
  const { token, collection } = params as {
    token: SupportedToken;
    collection: string;
  };
  const { twabsApi } = configs[token];
  const now = new Date();
  const twentyFourHoursAgo = new Date(
    (now.getTime() / 1000 - 24 * 60 * 60) * 1000
  ).toISOString();
  const client = createClient({
    requestPolicy: "network-only",
    url: twabsApi,
    exchanges: [fetchExchange, cacheExchange],
  });
  const { data, error } = await client
    .query(
      latestTwabForCollectionBeforeTime,
      {
        collection,
        earlierThan: twentyFourHoursAgo,
      },
      {
        fetchOptions: {
          headers: {
            "content-type": "application/json",
            "x-hasura-admin-secret": process.env.HASURA_ADMIN_KEY!,
          },
          method: "POST",
        },
      }
    )
    .toPromise();

  if (error || !data) {
    json(null);
  }

  return json(data);
}
