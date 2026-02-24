type LabeledValueProps = {
  label: string;
  value: string;
};

export default function LabeledValue({ label, value }: LabeledValueProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-default-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}
