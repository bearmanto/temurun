"use client";

export default function QtyInput({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.max(min, value + 1));

  return (
    <div className="inline-flex items-stretch overflow-hidden rounded border">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={dec}
        className="px-2"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        value={value}
        onChange={(e) => {
          const next = parseInt(e.target.value || "0", 10);
          onChange(Number.isNaN(next) ? min : Math.max(min, next));
        }}
        className="w-12 border-x px-2 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={inc}
        className="px-2"
      >
        +
      </button>
    </div>
  );
}
