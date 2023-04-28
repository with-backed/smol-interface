import { useMemo } from "react";
import { useGlobalStore } from "~/lib/globalStore";

export function FrogCooker() {
  const riskLevel = useGlobalStore((s) => s.inProgressLoan?.riskLevel);
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
    <div>
      <img src={image} alt={`this frog is feeling ${riskLevel}`} />
    </div>
  );
}
