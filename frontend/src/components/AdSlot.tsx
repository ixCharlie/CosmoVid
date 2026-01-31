'use client';

interface AdSlotProps {
  id: string;
  label: string;
}

export function AdSlot({ id, label }: AdSlotProps) {
  return (
    <div id={id} className="ad-slot" role="complementary" aria-label={label}>
      {label}
    </div>
  );
}
