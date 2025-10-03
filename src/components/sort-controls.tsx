import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortField, SortDirection, SortConfig, SORT_OPTIONS } from '@/lib/sorting';
import { cn } from '@/lib/utils';

interface SortControlsProps {
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  className?: string;
}

export function SortControls({ sortConfig, onSortChange, className }: SortControlsProps) {
  const handleFieldChange = (field: SortField) => {
    let direction = sortConfig.direction;
    
    if (field === 'score') {
      direction = 'desc';
    } else if (field === 'title') {
      direction = 'asc';
    }
    
    onSortChange({ ...sortConfig, field, direction });
  };

  const handleDirectionToggle = () => {
    onSortChange({
      ...sortConfig,
      direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortIcon = () => {
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="w-4 h-4" />;
    }
    return <ArrowDown className="w-4 h-4" />;
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Select value={sortConfig.field} onValueChange={handleFieldChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleDirectionToggle}
        className="h-9 px-3"
      >
        {getSortIcon()}
      </Button>
    </div>
  );
}
