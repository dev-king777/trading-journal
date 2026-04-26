export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  return <span className={className}>{prefix}{value.toFixed(decimals)}{suffix}</span>;
}
