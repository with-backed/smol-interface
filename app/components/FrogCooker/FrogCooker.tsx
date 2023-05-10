import { useMemo } from "react";
import { type RiskLevel } from "~/lib/globalStore";

type FrogCookerProps = {
  riskLevel: RiskLevel | undefined;
};

export function FrogCooker({ riskLevel }: FrogCookerProps) {
  const image = useMemo(() => {
    switch (riskLevel) {
      case "risky":
        return "/scale/4-risky-super-dance.svg";
      case "yikes":
        return "/scale/4-yikes-super-dance.svg";
      default:
        return "/scale/4-fine-super-dance.svg";
    }
  }, [riskLevel]);

  return (
    <div className="mt-auto">
      <img
        className="scalable"
        src={image}
        alt={`this frog is feeling ${riskLevel}`}
      />
    </div>
  );
}
