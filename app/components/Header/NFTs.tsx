import { useAsset } from "@center-inc/react";
import { useMemo } from "react";

type NFTsProps = {
  collectionAddress: string;
  tokenIds: string[];
};

export function NFTs({ collectionAddress, tokenIds }: NFTsProps) {
  const assets = useAsset({
    address: collectionAddress,
    tokenId: tokenIds[0],
  });
  const assetUrl = useMemo(() => {
    return assets[0].mediaUrl;
  }, [assets]);

  return (
    <div className="w-7 h-7">
      <div className="w-full h-full">
        {!assetUrl && <span>...</span>}
        {assetUrl && <img src={assetUrl} alt="nft" className="rounded-lg" />}
      </div>
    </div>
  );
}
