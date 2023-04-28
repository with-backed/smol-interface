import { useEffect, useMemo } from "react";
import type { RadioStateReturn } from "reakit/Radio";
import { useRadioState, Radio, RadioGroup } from "reakit/Radio";
import type { RiskLevel } from "~/lib/globalStore";

type RiskRadioProps = {
  riskLevel?: RiskLevel;
  handleChange: (riskLevel: RiskLevel) => void;
  disabled?: boolean;
};

const levels: RiskLevel[] = ["fine", "risky", "yikes"];

export function RiskRadio({
  disabled,
  handleChange,
  riskLevel,
}: RiskRadioProps) {
  const radio = useRadioState({ state: riskLevel });

  useEffect(() => {
    if (radio.state !== riskLevel) {
      // do things here
      handleChange(radio.state as RiskLevel);
    }
  }, [handleChange, radio.state, riskLevel]);

  return (
    <RadioGroup
      className="flex justify-center gap-1"
      {...radio}
      aria-label="fruits"
    >
      {levels.map((level) => (
        <CustomRadio key={level} {...radio} value={level} disabled={false} />
      ))}
    </RadioGroup>
  );
}

type CustomRadioProps = RadioStateReturn & {
  value: RiskLevel;
  disabled?: boolean;
};

const colorLookup: {
  [key in RiskLevel]: { background: string; border: string };
} = {
  fine: { background: "bg-fine", border: "border-fine" },
  risky: { background: "bg-risky", border: "border-risky" },
  yikes: { background: "bg-yikes", border: "border-yikes" },
};

function CustomRadio({ disabled, value, ...radio }: CustomRadioProps) {
  const className = useMemo(() => {
    const isSelected = radio.state === value;
    const { background, border } = colorLookup[value];
    const base = "border-2 rounded-lg px-8 py-2";
    if (isSelected) {
      return `${base} ${background} ${border} text-[#000000]`;
    }
    return `${base} bg-[#FFFFFF] ${border}`;
  }, [radio.state, value]);
  return (
    <Radio
      as="div"
      className={className}
      {...radio}
      value={value}
      disabled={disabled}
    >
      {value}
    </Radio>
  );
}
