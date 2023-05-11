import { useCallback, useEffect, useState } from "react";
import { useConfig } from "../useConfig";

export type AccountNFTsResponse = {
  address: string;
  tokenId: string;
};

export const useAccountNFTs = (
  address: string | undefined,
  collections: string[] | undefined
) => {
  const { centerKey } = useConfig();
  const [nftsLoading, setNftsLoading] = useState<boolean>(true);
  const [nftsFromCenter, setNFTsFromCenter] = useState<
    AccountNFTsResponse[] | undefined
  >(undefined);

  const fetchUserNFTs = useCallback(async () => {
    if (address && collections) {
      const res = await fetch(
        `https://api.center.dev/v1/ethereum-goerli/account/${address}/assets-owned?collection=${collections?.join(
          ","
        )}&limit=100`,
        {
          headers: {
            "x-API-Key": centerKey,
          },
        }
      );
      const json = await res.json();
      setNFTsFromCenter(json.items);
      setNftsLoading(false);
    }
  }, [address, collections, centerKey]);

  const reexecuteQuery = useCallback(() => {
    setNftsLoading(true);
    fetchUserNFTs();
  }, [fetchUserNFTs]);

  useEffect(() => {
    fetchUserNFTs();
  }, [fetchUserNFTs]);

  return {
    nftsFromCenter,
    nftsLoading,
    reexecuteQuery,
  };
};
