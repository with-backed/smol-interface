import { Asset } from "@center-inc/react";
import Marquee from "react-fast-marquee";

type NFTsProps = {
  collectionAddress: string;
  tokenIds: string[];
};

export function NFTs({ collectionAddress, tokenIds }: NFTsProps) {
  return (
    <div className="w-7 h-7 overflow-hidden rounded-lg">
      <div className="w-full h-full">
        <Marquee play={tokenIds.length > 1} className="marquee">
          {tokenIds.map((tokenId) => (
            <Asset
              key={tokenId}
              address={collectionAddress}
              tokenId={tokenId}
              renderLoading={() => <img src="/loading-ellipses.svg" />}
            />
          ))}
        </Marquee>
      </div>
    </div>
  );
}
