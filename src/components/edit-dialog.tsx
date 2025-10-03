import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Rating } from '@/components/rating';
import { Entry, ANIME_STATUS, MANGA_STATUS } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X } from 'lucide-react';

interface EditDialogProps {
  entry: Entry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Entry, updates: any) => Promise<void>;
}

export function EditDialog({ entry, isOpen, onClose, onSave }: EditDialogProps) {
  const [formData, setFormData] = useState({
    status: '',
    score: 0,
    progress: 0,
    notes: '',
    hiddenFromStatusLists: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (entry) {
      setFormData({
        status: entry.status,
        score: entry.rating || 0,
        progress: entry.progress,
        notes: entry.notes || '',
        hiddenFromStatusLists: false,
      });
    }
  }, [entry]);

  const handleSave = async () => {
    if (!entry) return;

    setIsLoading(true);
    try {
      const updates: any = {};
      
      if (formData.status !== entry.status) {
        updates.status = formData.status;
      }
      if (formData.score !== (entry.rating || 0)) {
        updates.score = formData.score;
      }
      if (formData.progress !== entry.progress) {
        updates.progress = formData.progress;
      }
      if (formData.notes !== (entry.notes || '')) {
        updates.notes = formData.notes;
      }
      if (formData.priority !== 0) {
        updates.priority = formData.priority;
      }
      if (formData.private !== false) {
        updates.private = formData.private;
      }
      if (formData.hiddenFromStatusLists !== false) {
        updates.hiddenFromStatusLists = formData.hiddenFromStatusLists;
      }

      await onSave(entry, updates);
      
      toast({
        title: "Success",
        description: `${entry.type === 'anime' ? 'Anime' : 'Manga'} updated successfully!`,
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update entry",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = entry?.type === 'anime' ? ANIME_STATUS : MANGA_STATUS;

  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Edit {entry.type === 'anime' ? 'Anime' : 'Manga'}</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Update the status, progress, and rating for {entry.title}
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={entry.title}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusOptions).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="score">Score</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">/ 10</span>
                </div>
                <Rating
                  value={formData.score}
                  onChange={(value) => setFormData({ ...formData, score: value })}
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress">
              {entry.type === 'anime' ? 'Episodes Watched' : 'Chapters Read'}
            </Label>
            <div className="flex items-center space-x-2">
              <Input
                id="progress"
                type="number"
                min="0"
                max={entry.type === 'anime' ? entry.totalEpisodes || 999 : entry.totalChapters || 999}
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                / {entry.type === 'anime' ? entry.totalEpisodes || '?' : entry.totalChapters || '?'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {entry.type === 'anime' ? 'Episodes' : 'Chapters'} watched/read
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add your thoughts..."
              rows={3}
            />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
