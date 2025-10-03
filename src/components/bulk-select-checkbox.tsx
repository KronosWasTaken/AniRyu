import { Checkbox } from '@/components/ui/checkbox';

interface BulkSelectCheckboxProps {
  itemId: string;
  isSelected: boolean;
  onToggle: (itemId: string) => void;
  className?: string;
}

export function BulkSelectCheckbox({
  itemId,
  isSelected,
  onToggle,
  className
}: BulkSelectCheckboxProps) {
  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={() => onToggle(itemId)}
      className={className}
      aria-label={`Select item ${itemId}`}
    />
  );
}
