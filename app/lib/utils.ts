import { getAddress } from "ethers/lib/utils.js";
import type { RiskLevel } from "./globalStore";
import type { ethers } from "ethers";
import { formatBigNum } from "./numberFormat";

export const riskLevelToLTV: {
  [key in RiskLevel]: { start: number; border: number };
} = {
  fine: {
    start: 50,
    border: 60,
  },
  risky: {
    start: 70,
    border: 90,
  },
  yikes: {
    start: 96,
    border: 100,
  },
};

export const getUniqueNFTId = (address: string, tokenId: string): string =>
  `${getAddress(address)}-${tokenId}`;

export const deconstructFromId = (id: string): [string, string] => {
  const indexOfDash = id.indexOf("-");
  const address = id.substring(0, indexOfDash);
  const tokenId = id.substring(indexOfDash + 1);
  return [address, tokenId];
};

export function riskLevelFromDebts(
  debt: ethers.BigNumber,
  maxDebt: ethers.BigNumber,
  paprTokenDecimals: number
): RiskLevel {
  const debtNumber = parseFloat(formatBigNum(debt, paprTokenDecimals));
  const maxDebtNumber = parseFloat(formatBigNum(maxDebt, paprTokenDecimals));
  const ratio = (debtNumber / maxDebtNumber) * 100;

  if (ratio < riskLevelToLTV.fine.start) return "fine";
  else if (ratio < riskLevelToLTV.risky.start) return "risky";
  else return "yikes";
}
