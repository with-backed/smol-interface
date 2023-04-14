import { useEffect, useMemo, useState } from "react";
import { useQuery } from "urql";
import { graphql } from "~/gql/erc721";
import type { NftsForAccountAndCollectionQuery } from "~/gql/erc721/graphql";
import { useConfig } from "~/hooks/useConfig";

const nftsForAccountAndCollectionDocument = graphql(`
  query nftsForAccountAndCollection($owner: String, $collections: [String!]) {
    tokens(where: { owner: $owner, registry_in: $collections }) {
      id
      registry {
        id
      }
      identifier
    }
  }
`);

export type AccountNFTsResponse = {
  address: string;
  tokenId: string;
};

export const useAccountNFTs = (
  address: string | undefined,
  collections: string[] | undefined
) => {
  const { erc721Subgraph } = useConfig();
  // Cache last result, so that when refreshing we don't have a flash of
  // blank page while new results are fetching
  const [prevData, setPrevData] = useState<
    NftsForAccountAndCollectionQuery | undefined
  >(undefined);

  const [{ data, fetching: nftsLoading }, reexecuteQuery] = useQuery({
    query: nftsForAccountAndCollectionDocument,
    variables: {
      owner: address?.toLowerCase(),
      collections: collections?.map((c) => c.toLowerCase()),
    },
    context: useMemo(
      () => ({
        url: erc721Subgraph,
      }),
      [erc721Subgraph]
    ),
  });

  useEffect(() => {
    if (data) {
      setPrevData(data);
    }
  }, [data]);

  const dataToUse = data ?? prevData;

  const userCollectionNFTs = useMemo(() => {
    if (!dataToUse?.tokens) return [];
    return dataToUse?.tokens.map((token) => ({
      address: token.registry.id,
      tokenId: token.identifier,
    }));
  }, [dataToUse]);

  return {
    userCollectionNFTs,
    nftsLoading,
    reexecuteQuery,
  };
};
