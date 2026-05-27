interface CurrencyAmountProps {
  amount: number;
  currency: string;
}

export function CurrencyAmount({ amount, currency }: CurrencyAmountProps) {
  return (
    <span>
      {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)}
    </span>
  );
}
