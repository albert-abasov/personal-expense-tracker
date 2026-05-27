interface BadgeProps {
  label: string;
  color?: string | null;
}

export function Badge({ label, color }: BadgeProps) {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-700';

  if (color) {
    bgColor = 'bg-gray-100';
    return (
      <span
        className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full`}
        style={{
          backgroundColor: `${color}20`,
          color: color,
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
}
