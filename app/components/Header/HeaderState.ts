export enum HeaderState {
  Default,
  // NoNFTs may not need to be a distinct state but rather a conditional render
  // in ListEligibleCollections
  NoNFTs,
  ListEligibleCollections,
  SelectNFTs,
}
