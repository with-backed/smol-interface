import { Asset } from "@center-inc/react";
import { ethers } from "ethers";
import { useCallback, useMemo } from "react";
import { Button } from "reakit/Button";
import { useQuery } from "urql";
import { graphql } from "~/gql";
import { usePaprController } from "~/hooks/usePaprController";
import { useExplainerStore } from "~/lib/explainerStore";

const debtIncreasedEventsQuery = graphql(`
  query allDebtIncreasedEvents {
    debtIncreasedEvents {
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
  const [{ data }] = useQuery({
    query: debtIncreasedEventsQuery,
  });

  const result = useMemo(() => {
    if (!data) return null;
    const map = {} as Record<string, ethers.BigNumber>;
    data.debtIncreasedEvents.forEach((e) => {
      const id = e.vault.token.id;
      if (!map[id]) map[id] = ethers.BigNumber.from(0);
      map[id] = map[id].add(e.amount);
    });
    return map;
  }, [data]);

  console.log({ result });
}

export function CollectionsPreviewExplainer() {
  const { allowedCollateral } = usePaprController();
  const setActiveExplainer = useExplainerStore((s) => s.setActiveExplainer);
  const handleClick = useCallback(() => {
    setActiveExplainer(null);
  }, [setActiveExplainer]);
  const thing = useTotalLentByCollection();
  return (
    <Button
      as="div"
      onClick={handleClick}
      className="explainer bg-white flex flex-col relative"
    >
      <table className="border-separate border-spacing-2">
        <thead>
          <tr>
            <th></th>
            <th className="text-left">Collection</th>
            <th className="text-right">Total Lent</th>
          </tr>
        </thead>
        <tbody>
          {allowedCollateral.map((ac) => (
            <tr key={ac.id}>
              <td className="w-8 h-8">
                <Asset preset="small" address={ac.token.id} tokenId={1} />
              </td>
              <td className="text-left">{ac.token.name}</td>
              <td className="text-right">0.00 ETH</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Button>
  );
}
