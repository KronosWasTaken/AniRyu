import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import MediaCard from '@/components/media-card';
import EmptyState from '@/components/empty-state';
import SyncStatus from '@/components/sync-status';
import { SortControls } from '@/components/sort-controls';
import { EditDialog } from '@/components/edit-dialog';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { BulkActions } from '@/components/bulk-actions';
import { useBulkSelect } from '@/hooks/use-bulk-select';
import { useAnimeApi } from '@/hooks/use-api';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { AnimeEntry, AnimeStatus } from '@/types';
import { Search, Filter, Grid, List, AlertCircle, Loader2, Download, RefreshCw, Trash2, BarChart3, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { SortConfig, sortMedia } from '@/lib/sorting';
import { animeApi } from '@/services/api';
import { motion } from 'motion/react';
import { useToast } from '@/hooks/use-toast';

function AnimeList() {
  const { animeList, isLoading, error, deleteAnime, refresh } = useAnimeApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AnimeStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'title',
    direction: 'asc'
  });
  const [gridColumns, setGridColumns] = useLocalStorage('aniryu-anime-grid-columns', 4);
  const [editingEntry, setEditingEntry] = useState<AnimeEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showBulkSelect, setShowBulkSelect] = useState(false);
  const { toast } = useToast();

  const statusCounts = useMemo(() => {
    if (!Array.isArray(animeList)) {
      return {
        total: 0,
        watching: 0,
        completed: 0,
        onHold: 0,
        dropped: 0,
        planToWatch: 0,
      };
    }

    return animeList.reduce(
      (counts: {
        total: number;
        watching: number;
        completed: number;
        onHold: number;
        dropped: number;
        planToWatch: number;
      }, anime: any) => {
        counts.total += 1;
        switch (anime.status) {
          case 'watching':
            counts.watching += 1;
            break;
          case 'completed':
            counts.completed += 1;
            break;
          case 'on-hold':
            counts.onHold += 1;
            break;
          case 'dropped':
            counts.dropped += 1;
            break;
          case 'plan-to-watch':
            counts.planToWatch += 1;
            break;
          default:
            break;
        }
        return counts;
      },
      {
        total: 0,
        watching: 0,
        completed: 0,
        onHold: 0,
        dropped: 0,
        planToWatch: 0,
      }
    );
  }, [animeList]);

  const filteredAnime = useMemo(() => {
    if (!Array.isArray(animeList)) return [];
    
    const filtered = animeList.filter((anime: any) => {
      const isSearchMatch = anime.title.toLowerCase().includes(searchTerm.toLowerCase());
      const isStatusMatch = statusFilter === 'all' || anime.status === statusFilter;
      return isSearchMatch && isStatusMatch;
    });
    
    return sortMedia(filtered, sortConfig);
  }, [animeList, searchTerm, statusFilter, sortConfig]);

  const bulkSelect = useBulkSelect(filteredAnime.length);

  const handleDelete = async (mediaId: number) => {
    await deleteAnime(mediaId);
  };

  const handleEdit = (entry: AnimeEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    const selectedIds = Array.from(bulkSelect.selectedItems);
    try {
      await Promise.all(selectedIds.map(id => deleteAnime(parseInt(id))));
      bulkSelect.clearSelection();
      setShowBulkSelect(false);
      toast({
        title: "Success",
        description: `Deleted ${selectedIds.length} anime entries`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some entries",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    const selectedIds = Array.from(bulkSelect.selectedItems);
    try {
      await Promise.all(selectedIds.map(id => 
        animeApi.editEntry(parseInt(id), { status })
      ));
      bulkSelect.clearSelection();
      setShowBulkSelect(false);
      toast({
        title: "Success",
        description: `Updated status for ${selectedIds.length} anime entries`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update some entries",
        variant: "destructive",
      });
    }
  };

  const handleBulkRatingChange = async (rating: number) => {
    const selectedIds = Array.from(bulkSelect.selectedItems);
    try {
      await Promise.all(selectedIds.map(id => 
        animeApi.editEntry(parseInt(id), { rating })
      ));
      bulkSelect.clearSelection();
      setShowBulkSelect(false);
      toast({
        title: "Success",
        description: `Updated rating for ${selectedIds.length} anime entries`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update some entries",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async (entry: AnimeEntry, updates: any) => {
    try {
      const response = await animeApi.editEntry(parseInt(entry.id), updates);
      if (response.error) {
        throw new Error(response.error);
      }
      await refresh();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update anime', { cause: error });
    }
  };

  const handleCloseEdit = () => {
    setEditingEntry(null);
    setIsEditDialogOpen(false);
  };


  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'watching', label: 'Watching' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'dropped', label: 'Dropped' },
    { value: 'plan-to-watch', label: 'Plan to Watch' },
  ];

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6"
      >
        <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-semibold text-foreground tracking-tight">My Anime List</h1>
                </div>
          </div>
        </div>
        <LoadingSkeleton layout={viewMode} />
      </motion.div>
    );
  }

  if (error) {
    const isOffline = /network/i.test(error);
    const errorMessage = isOffline
      ? 'Backend is offline — start the server and refresh.'
      : error;

    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load anime list</h3>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
      className="container mx-auto px-4 py-8 space-y-6"
    >
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight font-sora">
                My Anime List
              </h1>
              <Button asChild variant="outline" size="sm" className="transition-all duration-200 hover:shadow-xs">
                <Link to="/deleted" className="flex items-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Deleted Entries</span>
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Total: {statusCounts.total}</Badge>
              <Badge variant="outline">Watching: {statusCounts.watching}</Badge>
              <Badge variant="outline">Completed: {statusCounts.completed}</Badge>
              <Badge variant="outline">On Hold: {statusCounts.onHold}</Badge>
              <Badge variant="outline">Dropped: {statusCounts.dropped}</Badge>
              <Badge variant="outline">Plan to Watch: {statusCounts.planToWatch}</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              disabled={isLoading}
              className="transition-all duration-200 hover:shadow-xs"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
            <Button asChild variant="outline" size="sm" className="transition-all duration-200 hover:shadow-xs">
              <Link to="/statistics" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="transition-all duration-200 hover:shadow-xs hidden sm:flex">
              <Link to="/import" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Import</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="transition-all duration-200 hover:shadow-xs sm:hidden">
              <Link to="/import" className="flex items-center">
                <Download className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline-solid'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="transition-all duration-200 hover:shadow-xs"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline-solid'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="transition-all duration-200 hover:shadow-xs"
            >
              <List className="w-4 h-4" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="transition-all duration-200 hover:shadow-xs"
                >
                  Grid Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Grid Settings</DialogTitle>
                  <DialogDescription>
                    Adjust how many cards appear per row in grid view.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Columns</span>
                    <span>{gridColumns}</span>
                  </div>
                  <Slider
                    min={2}
                    max={8}
                    step={1}
                    value={[gridColumns]}
                    onValueChange={(value) => setGridColumns(value[0])}
                  />
                  <div className="text-xs text-muted-foreground">
                    Use more columns for a denser grid.
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search anime..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-effect"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AnimeStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-48 glass-effect">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <SortControls 
            sortConfig={sortConfig}
            onSortChange={setSortConfig}
            className="w-full sm:w-auto"
          />

          <Button
            variant={showBulkSelect ? "default" : "outline-solid"}
            size="sm"
            onClick={() => {
              setShowBulkSelect(!showBulkSelect);
              if (showBulkSelect) {
                bulkSelect.clearSelection();
              }
            }}
            className="transition-all duration-200 hover:shadow-xs flex items-center space-x-2 h-9"
          >
            <CheckSquare className="w-4 h-4" />
            <span>{showBulkSelect ? "Exit Select" : "Select Multiple"}</span>
          </Button>
        </div>
      </div>

      {showBulkSelect && (
        <BulkActions
          selectedCount={bulkSelect.selectedCount}
          onBulkDelete={handleBulkDelete}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkRatingChange={handleBulkRatingChange}
          onClearSelection={bulkSelect.clearSelection}
          mediaType="anime"
        />
      )}

              {Array.isArray(filteredAnime) && filteredAnime.length === 0 ? (
        Array.isArray(animeList) && animeList.length === 0 ? (
          <EmptyState type="anime" />
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              No anime found matching your search criteria.
            </div>
          </div>
        )
      ) : (
        <>
          {viewMode === 'list' && (
            <div className="bg-card/50 rounded-lg border border-border/50 mb-4">
              <div className="flex items-center p-2 sm:p-3 border-b border-border/50 bg-muted/30">
                <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 mr-2 sm:mr-3"></div>
                <div className="flex-1 min-w-0 mr-2 sm:mr-4 text-xs sm:text-sm font-medium text-muted-foreground">Title</div>
                <div className="w-16 sm:w-20 shrink-0 mr-2 sm:mr-4 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:block">Status</div>
                <div className="w-12 sm:w-16 text-center mr-2 sm:mr-4 text-xs sm:text-sm font-medium text-muted-foreground">Progress</div>
                <div className="w-8 sm:w-12 text-center mr-2 sm:mr-4 text-xs sm:text-sm font-medium text-muted-foreground">Score</div>
                <div className="w-12 sm:w-16 shrink-0 text-center text-xs sm:text-sm font-medium text-muted-foreground">Actions</div>
              </div>
            </div>
          )}
          <div className={cn(
            "animate-fade-in",
            viewMode === 'grid' 
              ? "grid gap-3 sm:gap-4"
              : "bg-card/50 rounded-lg border border-border/50"
          )}
          style={viewMode === 'grid' ? { gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` } : undefined}>
                  {Array.isArray(filteredAnime) && filteredAnime.map((anime, index) => (
              <MediaCard
                key={`anime-${anime.media_id}-${index}`}
                layout={viewMode}
                index={index}
                entry={{
                  id: anime.media_id.toString(),
                  title: anime.title,
                  type: 'anime',
                  status: anime.status,
                  rating: anime.score,
                  progress: anime.progress,
                  totalEpisodes: anime.total,
                  genre: [], // Backend doesn't have genres yet
                  imageUrl: anime.image,
                  notes: anime.notes,
                }}
                onEdit={handleEdit}
                onDelete={() => handleDelete(anime.media_id)}
                isSelected={bulkSelect.isSelected(anime.media_id.toString())}
                onToggleSelection={bulkSelect.toggleSelection}
                showBulkSelect={showBulkSelect}
              />
            ))}
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>
          Showing {Array.isArray(filteredAnime) ? filteredAnime.length : 0} of {Array.isArray(animeList) ? animeList.length : 0} anime
        </div>
        <SyncStatus 
          lastSync={Array.isArray(animeList) && animeList.length > 0 ? new Date() : undefined}
          isOnline={!error}
          onRefresh={refresh}
        />
      </div>

      <EditDialog
        entry={editingEntry}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />
    </motion.div>
  );
}

export default AnimeList;