import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, RotateCcw, PlayCircle, BookOpen, Calendar, Star, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'motion/react';
import { animeApi, mangaApi } from '@/services/api';

interface DeletedEntry {
  id: number;
  title: string;
  media_id: number;
  status: string;
  score: number;
  progress: number;
  total: number;
  image: string;
  notes: string;
  is_adult: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

function DeletedEntries() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'anime' | 'manga'>('anime');
  const [deletedAnime, setDeletedAnime] = useState<DeletedEntry[]>([]);
  const [deletedManga, setDeletedManga] = useState<DeletedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringIds, setRestoringIds] = useState<Set<number>>(new Set());
  const [permanentlyDeletingIds, setPermanentlyDeletingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchDeletedEntries();
  }, []);

  const fetchDeletedEntries = async () => {
    setIsLoading(true);
    try {
      const animeResponse = await fetch('http://localhost:3001/api/anime/deleted');
      if (animeResponse.ok) {
        const animeData = await animeResponse.json();
        console.log('Deleted anime data:', animeData);
        setDeletedAnime(animeData.data || []);
      }

      const mangaResponse = await fetch('http://localhost:3001/api/manga/deleted');
      if (mangaResponse.ok) {
        const mangaData = await mangaResponse.json();
        console.log('Deleted manga data:', mangaData);
        setDeletedManga(mangaData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch deleted entries:', error);
      toast({
        title: "Error",
        description: "Failed to load deleted entries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (entry: DeletedEntry, type: 'anime' | 'manga') => {
    setRestoringIds(prev => new Set(prev).add(entry.media_id));
    
    try {
      const response = await fetch(`http://localhost:3001/api/${type}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ media_id: entry.media_id }),
      });

      if (response.ok) {
        toast({
          title: "Entry Restored!",
          description: `${entry.title} has been restored to your ${type} list.`,
        });

        if (type === 'anime') {
          setDeletedAnime(prev => prev.filter(item => item.media_id !== entry.media_id));
        } else {
          setDeletedManga(prev => prev.filter(item => item.media_id !== entry.media_id));
        }
      } else {
        throw new Error('Failed to restore entry');
      }
    } catch (error) {
      console.error('Failed to restore entry:', error);
      toast({
        title: "Restore Failed",
        description: "Failed to restore the entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRestoringIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(entry.media_id);
        return newSet;
      });
    }
  };

  const handlePermanentDelete = async (entry: DeletedEntry, type: 'anime' | 'manga') => {
    setPermanentlyDeletingIds(prev => new Set(prev).add(entry.media_id));
    
    try {
      const response = type === 'anime' 
        ? await animeApi.permanentlyDelete(entry.media_id)
        : await mangaApi.permanentlyDelete(entry.media_id);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Entry Permanently Deleted",
        description: `${entry.title} has been permanently deleted and cannot be recovered.`,
        variant: "destructive",
      });

      if (type === 'anime') {
        setDeletedAnime(prev => prev.filter(item => item.media_id !== entry.media_id));
      } else {
        setDeletedManga(prev => prev.filter(item => item.media_id !== entry.media_id));
      }
    } catch (error) {
      console.error('Failed to permanently delete entry:', error);
      toast({
        title: "Permanent Delete Failed",
        description: "Failed to permanently delete the entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPermanentlyDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(entry.media_id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'null' || dateString === '') {
      return 'Unknown date';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'watching': 'bg-red-500/20 text-red-500 border-red-500/30',
      'reading': 'bg-red-500/20 text-red-500 border-red-500/30',
      'completed': 'bg-green-500/20 text-green-500 border-green-500/30',
      'on_hold': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      'dropped': 'bg-gray-500/20 text-gray-500 border-gray-500/30',
      'planning': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    };
    return statusColors[status] || 'bg-gray-500/20 text-gray-500 border-gray-500/30';
  };

  const renderDeletedEntries = (entries: DeletedEntry[], type: 'anime' | 'manga') => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-48 bg-gray-700 rounded-lg"></div>
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (entries.length === 0) {
      return (
        <div className="text-center py-12">
          <Trash2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Deleted {type === 'anime' ? 'Anime' : 'Manga'}</h3>
          <p className="text-muted-foreground">
            Deleted {type === 'anime' ? 'anime' : 'manga'} entries will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {entries.map((entry, index) => (
            <motion.div
              key={entry.media_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              style={{ willChange: "transform, opacity" }}
            >
              <Card className="group hover:shadow-lg hover:shadow-red-500/25 hover:border-red-500/40 transition-all duration-200 border-red-500/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Cover Image */}
                    <div className="relative">
                      <img
                        src={entry.image || '/placeholder-anime.jpg'}
                        alt={entry.title}
                        className="w-full h-48 object-cover rounded-lg"
                        loading="lazy"
                        decoding="async"
                      />
                      {entry.is_adult && (
                        <Badge className="absolute top-2 right-2 bg-red-500/90 text-white text-xs">
                          18+
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                      {entry.title}
                    </h3>

                    {/* Status and Score */}
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getStatusColor(entry.status)}`}>
                        {entry.status.replace('_', ' ')}
                      </Badge>
                      {entry.score > 0 && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          {entry.score}
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{entry.progress}/{entry.total || '?'}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ 
                            width: entry.total > 0 ? `${(entry.progress / entry.total) * 100}%` : '0%' 
                          }}
                        />
                      </div>
                    </div>

                    {/* Deleted Date */}
                    <div className="text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Deleted {formatDate(entry.deleted_at)}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        onClick={() => handleRestore(entry, type)}
                        disabled={restoringIds.has(entry.media_id) || permanentlyDeletingIds.has(entry.media_id)}
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {restoringIds.has(entry.media_id) ? (
                          <>
                            <div className="w-3 h-3 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Restoring...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3 h-3 mr-2" />
                            Restore
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => handlePermanentDelete(entry, type)}
                        disabled={restoringIds.has(entry.media_id) || permanentlyDeletingIds.has(entry.media_id)}
                        size="sm"
                        variant="destructive"
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        {permanentlyDeletingIds.has(entry.media_id) ? (
                          <>
                            <div className="w-3 h-3 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 mr-2" />
                            Delete Permanently
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
      className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 font-sora">
            Deleted Entries
          </h1>
          <p className="text-muted-foreground">
            Restore deleted anime and manga entries from your recycle bin.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'anime' | 'manga')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="anime" className="flex items-center gap-2">
              <PlayCircle className="w-4 h-4" />
              Anime ({deletedAnime.length})
            </TabsTrigger>
            <TabsTrigger value="manga" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Manga ({deletedManga.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anime" className="space-y-4">
            {renderDeletedEntries(deletedAnime, 'anime')}
          </TabsContent>

          <TabsContent value="manga" className="space-y-4">
            {renderDeletedEntries(deletedManga, 'manga')}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}

export default DeletedEntries;
