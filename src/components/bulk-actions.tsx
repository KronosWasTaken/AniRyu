import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Star, Trash2, X } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: string) => void;
  onBulkRatingChange: (rating: number) => void;
  onClearSelection: () => void;
  mediaType: 'anime' | 'manga';
}

const statusOptions = [
  { value: 'watching', label: 'Watching' },
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'plan-to-watch', label: 'Plan to Watch' },
  { value: 'plan-to-read', label: 'Plan to Read' },
];

const ratingOptions = [
  { value: 0, label: 'No Rating' },
  { value: 1, label: '1 - Appalling' },
  { value: 2, label: '2 - Horrible' },
  { value: 3, label: '3 - Very Bad' },
  { value: 4, label: '4 - Bad' },
  { value: 5, label: '5 - Average' },
  { value: 6, label: '6 - Fine' },
  { value: 7, label: '7 - Good' },
  { value: 8, label: '8 - Very Good' },
  { value: 9, label: '9 - Great' },
  { value: 10, label: '10 - Masterpiece' },
];

export function BulkActions({
  selectedCount,
  onBulkDelete,
  onBulkStatusChange,
  onBulkRatingChange,
  onClearSelection,
  mediaType
}: BulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  const handleStatusChange = () => {
    if (selectedStatus) {
      onBulkStatusChange(selectedStatus);
      setSelectedStatus('');
    }
  };

  const handleRatingChange = () => {
    if (selectedRating) {
      onBulkRatingChange(parseInt(selectedRating));
      setSelectedRating('');
    }
  };

  return (
    <>
      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Set Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusChange}
                disabled={!selectedStatus}
                size="sm"
                className={cn(
                  "transition-all duration-200 hover:shadow-sm",
                  selectedStatus && "bg-red-600 hover:bg-red-700 text-white shadow-md"
                )}
              >
                Apply
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Set Rating" />
                </SelectTrigger>
                <SelectContent>
                  {ratingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleRatingChange}
                disabled={!selectedRating}
                size="sm"
                className={cn(
                  "transition-all duration-200 hover:shadow-sm",
                  selectedRating && "bg-red-600 hover:bg-red-700 text-white shadow-md"
                )}
              >
                Apply
              </Button>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="transition-all duration-200 hover:shadow-sm"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} {selectedCount === 1 ? 'item' : 'items'}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will move {selectedCount} {selectedCount === 1 ? 'item' : 'items'} to the deleted entries. 
              You can restore {selectedCount === 1 ? 'it' : 'them'} later or delete {selectedCount === 1 ? 'it' : 'them'} permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onBulkDelete();
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedCount} Items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
