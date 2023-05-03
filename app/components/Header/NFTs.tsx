import { Asset } from "@center-inc/react";
import Marquee from "react-fast-marquee";

type NFTsProps = {
  collectionAddress: string;
  tokenIds: string[];
};

export function NFTs({ collectionAddress, tokenIds }: NFTsProps) {
  return (
    <div className="w-7 h-7">
      <div className="w-full h-full overflow-hidden rounded-lg">
        <Marquee>
          {tokenIds.map((tokenId) => (
            <Asset
              key={tokenId}
              address={collectionAddress}
              tokenId={tokenId}
            />
          ))}
        </Marquee>
      </div>
    </div>
  );
}
