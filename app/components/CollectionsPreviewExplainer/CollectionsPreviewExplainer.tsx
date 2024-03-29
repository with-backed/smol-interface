import { ethers } from "ethers";
import { useCallback, useMemo } from "react";
import { useQuery } from "urql";
import { graphql } from "~/gql";
import { useLatestMarketPrice } from "~/hooks/useLatestMarketPrice";
import { usePaprController } from "~/hooks/usePaprController";
import { useExplainerStore } from "~/lib/explainerStore";
import { formatTokenAmount } from "~/lib/numberFormat";
import { TextButton } from "~/components/Buttons/TextButton";
import { useConfig } from "~/hooks/useConfig";
import { CenterAsset } from "../CenterAsset";

const debtIncreasedEventsQuery = graphql(`
  query allDebtIncreasedEvents {
    debtIncreasedEvents(first: 1000) {
      amount
      vault {
        token {
          id
        }
      }
    }
  }
`);

function useTotalLentByCollection() {
  const {
    paprToken: { decimals },
  } = usePaprController();

  const [{ data }] = useQuery({
    query: debtIncreasedEventsQuery,
  });

  const marketPrice = useLatestMarketPrice();

  const collatedDebtIncreases = useMemo(() => {
    if (!data) return null;
    const map = {} as Record<string, ethers.BigNumber>;
    data.debtIncreasedEvents.forEach((e) => {
      const id = e.vault.token.id;
      if (!map[id]) map[id] = ethers.BigNumber.from(0);
      map[id] = map[id].add(e.amount);
    });
    return map;
  }, [data]);

  const inPapr = useMemo(() => {
    if (!collatedDebtIncreases) return null;
    return Object.entries(collatedDebtIncreases).reduce(
      (prev, [id, amount]) => ({
        ...prev,
        [id]: parseFloat(ethers.utils.formatUnits(amount, decimals)),
      }),
      {} as Record<string, number>
    );
  }, [collatedDebtIncreases, decimals]);

  const inEth = useMemo(() => {
    if (!inPapr || !marketPrice) return null;
    return Object.entries(inPapr).reduce(
      (prev, [id, amount]) => ({
        ...prev,
        [id]: amount * marketPrice,
      }),
      {} as Record<string, number>
    );
  }, [inPapr, marketPrice]);

  return { inPapr, inEth };
}

export function CollectionsPreviewExplainer() {
  const { network } = useConfig();
  const { allowedCollateral } = usePaprController();
  const setActiveExplainer = useExplainerStore((s) => s.setActiveExplainer);
  const handleClick = useCallback(() => {
    setActiveExplainer(null);
  }, [setActiveExplainer]);
  const { inEth } = useTotalLentByCollection();

  const sortedCollateral = useMemo(() => {
    if (!inEth) {
      return [];
    }

    const collateral = allowedCollateral.map((c) => ({
      ...c,
      ethPrice: inEth[c.token.id] || 0,
    }));
    collateral.sort((a, b) => b.ethPrice - a.ethPrice);
    return collateral;
  }, [allowedCollateral, inEth]);

  return (
    <div className="explainer bg-white flex flex-col relative pt-[50px] overflow-scroll">
      <div className="flex flex-col justify-center items-center p-4 gap-7">
        <p className="text-center">
          hero NFTs get ETH loans and must come from these meme collections
        </p>
        <TextButton onClick={handleClick}>close</TextButton>
      </div>
      <table className="border-separate border-spacing-2">
        <thead className="uppercase">
          <tr>
            <th></th>
            <th className="text-left font-normal">Collection</th>
            <th className="text-right font-normal">Total Lent</th>
          </tr>
        </thead>
        <tbody>
          {sortedCollateral.map((c) => (
            <tr key={c.id}>
              <td className="w-8 h-8">
                <CenterAsset preset="small" address={c.token.id} tokenId={1} />
              </td>
              <td className="text-left max-w-[11rem] overflow-hidden text-ellipsis">
                <a
                  href={`https://marketplace.reservoir.tools/collection/${network}/${c.token.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="no-underline text-link-text"
                >
                  {c.token.name}
                </a>
              </td>
              <td className="text-right whitespace-nowrap">
                {formatTokenAmount(c.ethPrice)} ETH
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
