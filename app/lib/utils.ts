import { getAddress } from "ethers/lib/utils.js";
import type { RiskLevel } from "./globalStore";
import type { ethers } from "ethers";
import { formatBigNum } from "./numberFormat";

export const riskLevelToLTV: {
  [key in RiskLevel]: { start: number; default: number; border: number };
} = {
  fine: {
    start: 0,
    default: 50,
    border: 60,
  },
  risky: {
    start: 60,
    default: 70,
    border: 90,
  },
  yikes: {
    start: 90,
    default: 96,
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
): { riskLevel: RiskLevel; percentage: number } {
  const debtNumber = parseFloat(formatBigNum(debt, paprTokenDecimals));
  const maxDebtNumber = parseFloat(formatBigNum(maxDebt, paprTokenDecimals));
  const ratio = (debtNumber / maxDebtNumber) * 100;
  const riskLevel = (() => {
    if (ratio >= riskLevelToLTV.yikes.start) return "yikes";
    else if (ratio >= riskLevelToLTV.risky.start) return "risky";
    else return "fine";
  })();
  const range = riskLevelToLTV[riskLevel];
  const percentage = (ratio - range.start) / (range.border - range.start);
  return { riskLevel, percentage };
}

export function percentChange(v1: number, v2: number) {
  return (v2 - v1) / v1;
}
