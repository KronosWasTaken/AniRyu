import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { PlayCircle, BookOpen, Plus, X, Star, Search, Loader2, Calendar, Users, ExternalLink, CheckCircle, XCircle, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { searchApi, animeApi, mangaApi } from '@/services/api';
import { motion, AnimatePresence } from 'motion/react';
import { Rating } from '@/components/rating';

interface SearchResult {
  id: number;
  title: {
    english?: string;
    romaji?: string;
    native?: string;
  };
  coverImage: {
    large: string;
    extraLarge: string;
  };
  episodes?: number;
  chapters?: number;
  format: string;
  status: string;
  startDate?: {
    year?: number;
  };
  isAdult: boolean;
}

type MediaType = 'anime' | 'manga';

function AddEntry() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [mediaType, setMediaType] = useState<MediaType>('anime');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<SearchResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [existingEntries, setExistingEntries] = useState<Set<number>>(new Set());
  
  const [formData, setFormData] = useState({
    status: '',
    rating: '',
    progress: '',
    notes: '',
    hiddenFromStatusLists: false,
  });

  const [manualFormData, setManualFormData] = useState({
    title: '',
    status: '',
    rating: '',
    progress: '',
    total: '',
    imageUrl: '',
    notes: '',
    isAdult: false,
    hiddenFromStatusLists: false,
  });

  const animeStatuses = ['watching', 'completed', 'on-hold', 'dropped', 'plan-to-watch'];
  const mangaStatuses = ['reading', 'completed', 'on-hold', 'dropped', 'plan-to-read'];

  const offlineTabValue = `offline-${mediaType}`;

  const checkExistingEntries = useCallback(async (results: SearchResult[]) => {
    const existingSet = new Set<number>();
    
    for (const result of results) {
      try {
        const response = await searchApi.checkExists(result.id, mediaType);
        if (response.data && typeof response.data === 'object' && 'exists' in response.data && response.data.exists) {
          existingSet.add(result.id);
        }
      } catch (error) {
        console.error('Failed to check if entry exists:', error);
      }
    }
    
    setExistingEntries(existingSet);
  }, [mediaType]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await searchApi.search(query);
      console.log('Search response:', response);
      console.log('Response data:', response.data);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const searchData = (response.data as any)?.data || response.data;
      const results = searchData?.[mediaType]?.results || [];
      console.log('Search results for', mediaType, ':', results);
      if (results.length > 0) {
        console.log('First result coverImage:', results[0].coverImage);
        console.log('First result extraLarge:', results[0].coverImage.extraLarge);
        console.log('First result large:', results[0].coverImage.large);
      }
      setSearchResults(results);
      
      await checkExistingEntries(results);
    } catch (error: any) {
      console.error('Search error:', error);
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network error')) {
        toast({
          title: "Backend Not Running",
          description: "Please start the Go backend server first.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Search Failed",
          description: error.message || "Failed to search for media",
          variant: "destructive",
        });
      }
    } finally {
      setIsSearching(false);
    }
  }, [mediaType, toast, checkExistingEntries]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleSelectMedia = (media: SearchResult) => {
    setSelectedMedia(media);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedMedia || !formData.status) {
      toast({
        title: "Missing Information",
        description: "Please select a status.",
        variant: "destructive",
      });
      return;
    }

    try {
      const title = selectedMedia.title.english || selectedMedia.title.romaji || selectedMedia.title.native || 'Unknown';
      const response = mediaType === 'anime'
        ? await animeApi.addMedia(selectedMedia.id, 'anime', formData)
        : await mangaApi.addMedia(selectedMedia.id, 'manga', formData);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Entry Added!",
        description: `${title} has been added to your ${mediaType} list.`,
      });

      setFormData({
        status: '',
        rating: '',
        progress: '',
        notes: '',
        hiddenFromStatusLists: false,
      });
      setSearchQuery('');
      setSearchResults([]);
      setSelectedMedia(null);
      setIsDialogOpen(false);

      navigate(mediaType === 'anime' ? '/' : '/manga');
    } catch (error: any) {
      toast({
        title: "Failed to Add Entry",
        description: error.message || "Failed to add entry to your list",
        variant: "destructive",
      });
    }
  };

  const handleManualSubmit = async () => {
    if (!manualFormData.title.trim() || !manualFormData.status) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and status.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      media_type: mediaType,
      title: manualFormData.title.trim(),
      status: manualFormData.status,
      score: manualFormData.rating ? parseInt(manualFormData.rating) : 0,
      progress: manualFormData.progress ? parseInt(manualFormData.progress) : 0,
      total: manualFormData.total ? parseInt(manualFormData.total) : 0,
      image: manualFormData.imageUrl.trim() || undefined,
      notes: manualFormData.notes.trim() || '',
      is_adult: manualFormData.isAdult,
      hidden_from_status_lists: manualFormData.hiddenFromStatusLists,
    };

    try {
      const response = mediaType === 'anime'
        ? await animeApi.addManualMedia(payload)
        : await mangaApi.addManualMedia(payload);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Entry Added!",
        description: `${manualFormData.title.trim()} has been added to your ${mediaType} list.`,
      });

      setManualFormData({
        title: '',
        status: '',
        rating: '',
        progress: '',
        total: '',
        imageUrl: '',
        notes: '',
        isAdult: false,
        hiddenFromStatusLists: false,
      });

      navigate(mediaType === 'anime' ? '/' : '/manga');
    } catch (error: any) {
      toast({
        title: "Failed to Add Entry",
        description: error.message || "Failed to add entry to your list",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'watching': 'bg-red-500/20 text-red-400 border-red-500/30',
      'reading': 'bg-red-500/20 text-red-400 border-red-500/30',
      'completed': 'bg-green-500/20 text-green-400 border-green-500/30',
      'on-hold': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'dropped': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'plan-to-watch': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'plan-to-read': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getFormatColor = (format: string) => {
    const colors: Record<string, string> = {
      'TV': 'bg-blue-500/20 text-blue-400',
      'TV_SHORT': 'bg-blue-500/20 text-blue-400',
      'MOVIE': 'bg-purple-500/20 text-purple-400',
      'SPECIAL': 'bg-orange-500/20 text-orange-400',
      'OVA': 'bg-pink-500/20 text-pink-400',
      'ONA': 'bg-cyan-500/20 text-cyan-400',
      'MUSIC': 'bg-green-500/20 text-green-400',
      'MANGA': 'bg-red-500/20 text-red-400',
      'NOVEL': 'bg-yellow-500/20 text-yellow-400',
      'ONE_SHOT': 'bg-gray-500/20 text-gray-400',
    };
    return colors[format] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
      className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl"
    >
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2 font-sora">
          Add New Entry
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          Search and add anime or manga from AniList
        </p>
      </div>

      <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as MediaType)} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 glass-effect">
          <TabsTrigger value="anime" className="flex items-center space-x-2">
            <PlayCircle className="w-4 h-4" />
            <span>Anime</span>
          </TabsTrigger>
          <TabsTrigger value="manga" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Manga</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={mediaType}>
          <Card className="anime-card">
            <CardContent className="pt-6">
              <Tabs defaultValue="search" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="search" className="flex items-center space-x-2">
                    <Search className="w-4 h-4" />
                    <span>Add Entry</span>
                  </TabsTrigger>
                  <TabsTrigger value={offlineTabValue} className="flex items-center space-x-2">
                    <WifiOff className="w-4 h-4" />
                    <span>Add Entry (Offline)</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="search">
                  {/* Xenylist-style Search */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder={`Search ${mediaType}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 text-base"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                    </div>

                    {/* Search Results - Netflix Style Grid */}
                    <AnimatePresence>
                      {searchResults.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6"
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {searchResults.map((result, index) => (
                              <motion.div
                                key={`search-${result.id}-${index}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05, duration: 0.2 }}
                                className={`group cursor-pointer ${
                                  existingEntries.has(result.id) 
                                    ? 'opacity-75 cursor-not-allowed' 
                                    : 'hover:scale-105'
                                }`}
                                onClick={() => !existingEntries.has(result.id) && handleSelectMedia(result)}
                              >
                                <div className="relative aspect-3/4 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                                  <img
                                    src={result.coverImage.extraLarge || result.coverImage.large}
                                    alt={result.title.english || result.title.romaji}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                  
                                  {/* Overlay */}
                                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  
                                  {/* Content Overlay */}
                                  <div className="absolute bottom-0 left-0 right-0 p-3 pb-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                      <h3 className="text-white font-semibold text-sm line-clamp-2 drop-shadow-lg flex-1">
                                        {result.title.english || result.title.romaji || result.title.native}
                                      </h3>
                                      <a
                                        href={`https://anilist.co/${mediaType}/${result.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10 relative"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ExternalLink className="w-3 h-3 text-white" />
                                      </a>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <Badge 
                                        variant="secondary" 
                                        className={`text-xs ${getFormatColor(result.format)}`}
                                      >
                                        {result.format.replace('_', ' ')}
                                      </Badge>
                                      {existingEntries.has(result.id) ? (
                                        <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                                          <CheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center w-8 h-8 bg-black/50 backdrop-blur-xs rounded-full hover:bg-black/70 transition-colors">
                                          <Plus className="w-4 h-4 text-white" />
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Adult Badge */}
                                  {result.isAdult && (
                                    <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
                                      18+
                                    </Badge>
                                  )}

                                  {/* Added Overlay */}
                                  {existingEntries.has(result.id) && (
                                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center pointer-events-none">
                                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        <CheckCircle className="w-4 h-4 mr-1 inline" />
                                        Added
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Empty State */}
                    {searchQuery && !isSearching && searchResults.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8"
                      >
                        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No {mediaType} found for "{searchQuery}"</p>
                        <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                      </motion.div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value={offlineTabValue}>
                  <div className="space-y-6">
                    <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                      Add entries without AniList. Provide the details you want saved for this {mediaType}.
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="manual-title">Title *</Label>
                        <Input
                          id="manual-title"
                          value={manualFormData.title}
                          onChange={(e) => setManualFormData((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder={`Enter ${mediaType} title`}
                        />
                      </div>

                      <div>
                        <Label htmlFor="manual-status">Status *</Label>
                        <Select
                          value={manualFormData.status}
                          onValueChange={(value) => setManualFormData((prev) => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger id="manual-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {(mediaType === 'anime' ? animeStatuses : mangaStatuses).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="manual-rating">Rating</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Input
                                id="manual-rating"
                                type="number"
                                min="0"
                                max="10"
                                value={manualFormData.rating}
                                onChange={(e) => setManualFormData((prev) => ({ ...prev, rating: e.target.value }))}
                                placeholder="0"
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">/ 10</span>
                            </div>
                            <Rating
                              value={parseInt(manualFormData.rating) || 0}
                              onChange={(value) => setManualFormData((prev) => ({ ...prev, rating: value.toString() }))}
                              size="sm"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="manual-progress">
                            {mediaType === 'anime' ? 'Episodes Watched' : 'Chapters Read'}
                          </Label>
                          <Input
                            id="manual-progress"
                            type="number"
                            min="0"
                            value={manualFormData.progress}
                            onChange={(e) => setManualFormData((prev) => ({ ...prev, progress: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="manual-total">
                            {mediaType === 'anime' ? 'Total Episodes' : 'Total Chapters'}
                          </Label>
                          <Input
                            id="manual-total"
                            type="number"
                            min="0"
                            value={manualFormData.total}
                            onChange={(e) => setManualFormData((prev) => ({ ...prev, total: e.target.value }))}
                            placeholder="0"
                          />
                        </div>

                        <div className="flex items-end">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="manual-isAdult"
                              checked={manualFormData.isAdult}
                              onCheckedChange={(checked) =>
                                setManualFormData((prev) => ({ ...prev, isAdult: checked }))
                              }
                            />
                            <Label htmlFor="manual-isAdult" className="text-sm">
                              Adult content
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="manual-image">Cover Image URL</Label>
                        <Input
                          id="manual-image"
                          value={manualFormData.imageUrl}
                          onChange={(e) => setManualFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="manual-notes">Notes</Label>
                        <Textarea
                          id="manual-notes"
                          value={manualFormData.notes}
                          onChange={(e) => setManualFormData((prev) => ({ ...prev, notes: e.target.value }))}
                          placeholder="Add your thoughts..."
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="manual-hidden"
                          checked={manualFormData.hiddenFromStatusLists}
                          onCheckedChange={(checked) =>
                            setManualFormData((prev) => ({ ...prev, hiddenFromStatusLists: checked }))
                          }
                        />
                        <Label htmlFor="manual-hidden" className="text-sm">
                          Hide from status lists
                        </Label>
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleManualSubmit} disabled={!manualFormData.title || !manualFormData.status}>
                          Add Offline Entry
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {mediaType === 'anime' ? (
                <PlayCircle className="w-5 h-5 text-primary" />
              ) : (
                <BookOpen className="w-5 h-5 text-primary" />
              )}
              <span>Add to {mediaType === 'anime' ? 'Anime' : 'Manga'} List</span>
            </DialogTitle>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4">
              {/* Media Preview */}
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <img
                  src={selectedMedia.coverImage.extraLarge || selectedMedia.coverImage.large}
                  alt={selectedMedia.title.english || selectedMedia.title.romaji}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2">
                    {selectedMedia.title.english || selectedMedia.title.romaji || selectedMedia.title.native}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedMedia.format} • {selectedMedia.status}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {(mediaType === 'anime' ? animeStatuses : mangaStatuses).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          id="rating"
                          type="number"
                          min="0"
                          max="10"
                          value={formData.rating}
                          onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                          placeholder="0"
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">/ 10</span>
                      </div>
                      <Rating
                        value={parseInt(formData.rating) || 0}
                        onChange={(value) => setFormData(prev => ({ ...prev, rating: value.toString() }))}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="progress">
                      {mediaType === 'anime' ? 'Episodes Watched' : 'Chapters Read'}
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="progress"
                        type="number"
                        min="0"
                        max={mediaType === 'anime' ? selectedMedia.episodes || 999 : selectedMedia.chapters || 999}
                        value={formData.progress}
                        onChange={(e) => setFormData(prev => ({ ...prev, progress: e.target.value }))}
                        placeholder="0"
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        / {mediaType === 'anime' ? selectedMedia.episodes || '?' : selectedMedia.chapters || '?'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add your thoughts..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hiddenFromStatusLists"
                    checked={formData.hiddenFromStatusLists}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hiddenFromStatusLists: checked }))}
                  />
                  <Label htmlFor="hiddenFromStatusLists" className="text-sm">
                    Hide from status lists
                  </Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.status}>
              Add to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default AddEntry;