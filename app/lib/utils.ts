import { getAddress } from "ethers/lib/utils.js";

export const getUniqueNFTId = (address: string, tokenId: string): string =>
  `${getAddress(address)}-${tokenId}`;

export const deconstructFromId = (id: string): [string, string] => {
  const indexOfDash = id.indexOf("-");
  const address = id.substring(0, indexOfDash);
  const tokenId = id.substring(indexOfDash + 1);
  return [address, tokenId];
};
