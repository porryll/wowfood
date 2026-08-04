import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  quantity: number;
  disabled?: boolean;
  onAdd: () => void;
  onReduce: () => void;
}

export function QuantityStepper({
  quantity,
  disabled = false,
  onAdd,
  onReduce
}: QuantityStepperProps) {
  if (quantity <= 0) {
    return (
      <button
        disabled={disabled}
        onClick={onAdd}
        className="flex h-11 min-w-11 items-center justify-center rounded-full bg-brand-green text-white disabled:bg-slate-300"
        aria-label="加入购物车"
      >
        <Plus size={20} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onReduce}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-green text-brand-green"
        aria-label="减少数量"
      >
        <Minus size={18} />
      </button>
      <span className="min-w-6 text-center font-semibold">{quantity}</span>
      <button
        disabled={disabled}
        onClick={onAdd}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green text-white disabled:bg-slate-300"
        aria-label="增加数量"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
