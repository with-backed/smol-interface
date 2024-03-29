import { useEffect, useMemo } from "react";
import type { RadioStateReturn } from "reakit/Radio";
import { useRadioState, Radio, RadioGroup } from "reakit/Radio";
import type { RiskLevel } from "~/lib/globalStore";

type RiskRadioProps = {
  riskLevel: RiskLevel;
  handleChange: (riskLevel: RiskLevel) => void;
};

const levels: RiskLevel[] = ["fine", "risky", "yikes"];

export function RiskRadio({ handleChange, riskLevel }: RiskRadioProps) {
  const radio = useRadioState({ state: riskLevel });

  useEffect(() => {
    if (radio.state !== riskLevel) {
      handleChange(radio.state as RiskLevel);
    }
  }, [handleChange, radio.state, riskLevel]);

  return (
    <RadioGroup
      className="flex justify-center gap-4 py-2"
      {...radio}
      aria-label="fruits"
    >
      {levels.map((level) => (
        <CustomRadio key={level} {...radio} value={level} />
      ))}
    </RadioGroup>
  );
}

type CustomRadioProps = RadioStateReturn & {
  value: RiskLevel;
};

const colorLookup: {
  [key in RiskLevel]: { backgroundColor: string; borderColor: string };
} = {
  fine: { backgroundColor: "bg-fine", borderColor: "border-fine" },
  risky: { backgroundColor: "bg-risky", borderColor: "border-risky" },
  yikes: { backgroundColor: "bg-yikes", borderColor: "border-yikes" },
};

function CustomRadio({ value, ...radio }: CustomRadioProps) {
  const className = useMemo(() => {
    const isSelected = radio.state === value;
    const { backgroundColor, borderColor } = colorLookup[value];
    const base =
      "border-2 rounded-lg px-4 py-2 h-9 flex items-center cursor-pointer";
    if (isSelected) {
      return `${base} ${backgroundColor} ${borderColor}`;
    }
    return `${base} bg-[#FFFFFF] ${borderColor}`;
  }, [radio.state, value]);
  return (
    <Radio as="div" className={className} {...radio} value={value}>
      {value}
    </Radio>
  );
}
