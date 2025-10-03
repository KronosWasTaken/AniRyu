import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Entry } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { BulkSelectCheckbox } from '@/components/bulk-select-checkbox';

interface MediaCardProps {
  entry: Entry;
  onEdit?: (entry: Entry) => void;
  onDelete?: (id: string) => void;
  layout?: 'grid' | 'list';
  index?: number;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
  showBulkSelect?: boolean;
}

const STATUS_COLORS = new Map([
  ['watching', 'bg-red-500/20 text-red-400 border-red-500/30'],
  ['reading', 'bg-red-500/20 text-red-400 border-red-500/30'],
  ['completed', 'bg-green-500/20 text-green-400 border-green-500/30'],
  ['on-hold', 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'],
  ['dropped', 'bg-gray-500/20 text-gray-400 border-gray-500/30'],
  ['plan-to-watch', 'bg-blue-500/20 text-blue-400 border-blue-500/30'],
  ['plan-to-read', 'bg-blue-500/20 text-blue-400 border-blue-500/30'],
]);

function MediaCard({ 
  entry, 
  onEdit, 
  onDelete, 
  layout = 'grid', 
  index = 0,
  isSelected = false,
  onToggleSelection,
  showBulkSelect = false
}: MediaCardProps) {
  const progressText = entry.type === 'anime'
    ? `${entry.progress}${entry.totalEpisodes ? `/${entry.totalEpisodes}` : ''} episodes watched`
    : `${entry.progress}${entry.totalChapters ? `/${entry.totalChapters}` : ''} chapters read`;

  if (layout === 'list') {
    const anilistUrl = `https://anilist.co/${entry.type}/${entry.id}`;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02, duration: 0.15, ease: "easeOut" }}
        whileHover={{ y: -1 }}
        style={{ willChange: "transform" }}
        className={cn(
          "flex items-center p-3 sm:p-4 border-b border-red-500/20 hover:bg-red-500/10 transition-all duration-200 group",
          isSelected && "bg-blue-500/10 border-blue-500/30",
          showBulkSelect && "cursor-pointer"
        )}
        onClick={showBulkSelect ? () => onToggleSelection?.(entry.id) : undefined}
      >
        {/* Bulk Select Checkbox */}
        {showBulkSelect && (
          <div 
            className="flex-shrink-0 mr-2"
            onClick={(e) => e.stopPropagation()}
          >
            <BulkSelectCheckbox
              itemId={entry.id}
              isSelected={isSelected}
              onToggle={onToggleSelection!}
            />
          </div>
        )}

        {/* Cover Image */}
        <motion.div 
          className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 mr-3 sm:mr-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ willChange: "transform" }}
        >
          {entry.imageUrl ? (
            <img 
              src={entry.imageUrl} 
              alt={entry.title}
              className="w-full h-full object-cover rounded-md shadow-sm"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full bg-muted rounded-md flex items-center justify-center shadow-sm">
              <span className="text-xs text-muted-foreground">?</span>
            </div>
          )}
        </motion.div>

        {/* Title */}
        <div 
          className="flex-1 min-w-0 mr-2 sm:mr-4"
          onClick={(e) => e.stopPropagation()}
        >
          <a
            href={anilistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-medium hover:text-primary transition-colors cursor-pointer line-clamp-1 leading-tight block"
          >
            {entry.title}
          </a>
          <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            Open in AniList
          </div>
        </div>

        {/* Status */}
        <div className="w-20 sm:w-24 flex-shrink-0 mr-2 sm:mr-4">
          <Badge 
            variant="outline" 
            className={cn("text-xs font-medium", STATUS_COLORS.get(entry.status))}
          >
            <span className="hidden sm:inline">{entry.status.replace('-', ' ')}</span>
            <span className="sm:hidden">{entry.status.charAt(0).toUpperCase()}</span>
          </Badge>
        </div>

        {/* Progress */}
        <div className="w-16 sm:w-20 text-center text-xs sm:text-sm text-muted-foreground mr-2 sm:mr-4 font-medium">
          {entry.type === 'anime' 
            ? `${entry.progress}${entry.totalEpisodes ? `/${entry.totalEpisodes}` : ''}`
            : `${entry.progress}${entry.totalChapters ? `/${entry.totalChapters}` : ''}`
          }
        </div>

        {/* Score */}
        <div className="w-8 sm:w-12 text-center text-xs sm:text-sm text-muted-foreground mr-2 sm:mr-4">
          {entry.rating ? (
            <div className="flex items-center justify-center space-x-1">
              <Star className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-500 fill-current" />
              <span className="font-medium text-xs sm:text-sm">{entry.rating}</span>
            </div>
          ) : (
            <span className="text-muted-foreground/60 text-xs sm:text-sm">-</span>
          )}
        </div>

        {/* Actions */}
        <motion.div 
          className="w-12 sm:w-16 flex-shrink-0 flex justify-center space-x-1"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ willChange: "opacity" }}
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence>
            {onEdit && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                style={{ willChange: "transform, opacity" }}
              >
                <Button
                  size="xs"
                  variant="ghost"
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:bg-accent/80"
                  onClick={() => onEdit(entry)}
                >
                  <Edit className="w-2 h-2 sm:w-3 sm:h-3" />
                </Button>
              </motion.div>
            )}
            {onDelete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.1, delay: 0.05, ease: "easeOut" }}
                style={{ willChange: "transform, opacity" }}
              >
                <Button
                  size="xs"
                  variant="ghost"
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(entry.id)}
                >
                  <Trash2 className="w-2 h-2 sm:w-3 sm:h-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.15, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      style={{ willChange: "transform" }}
    >
      <Card 
        className={cn(
          "modern-card group overflow-hidden",
          isSelected && "ring-2 ring-blue-500",
          showBulkSelect && "cursor-pointer"
        )}
        onClick={showBulkSelect ? () => onToggleSelection?.(entry.id) : undefined}
      >
      <div className="relative">
        {/* Bulk Select Checkbox */}
        {showBulkSelect && (
          <div 
            className="absolute top-2 left-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <BulkSelectCheckbox
              itemId={entry.id}
              isSelected={isSelected}
              onToggle={onToggleSelection!}
              className="bg-background/90 backdrop-blur-sm"
            />
          </div>
        )}

        {entry.imageUrl ? (
          <motion.img 
            src={entry.imageUrl} 
            alt={entry.title}
            className="w-full h-64 object-cover rounded-t-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ willChange: "transform" }}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-64 bg-muted flex items-center justify-center rounded-t-lg">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}
        
        <motion.div 
          className="absolute top-2 right-2"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ willChange: "opacity" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex space-x-1">
            <AnimatePresence>
              {onEdit && (
                <motion.div
                  key="edit-button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                  style={{ willChange: "transform, opacity" }}
                >
                  <Button
                    size="xs"
                    variant="secondary"
                    className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm shadow-sm hover:shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={() => onEdit(entry)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </motion.div>
              )}
              {onDelete && (
                <motion.div
                  key="delete-button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.1, delay: 0.05, ease: "easeOut" }}
                  style={{ willChange: "transform, opacity" }}
                >
                  <Button
                    size="xs"
                    variant="destructive"
                    className="h-8 w-8 p-0 bg-destructive/90 backdrop-blur-sm shadow-sm hover:shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    onClick={() => onDelete(entry.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <CardHeader 
        className="pb-3"
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href={`https://anilist.co/${entry.type}/${entry.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-tight cursor-pointer hover:underline"
        >
          {entry.title}
        </a>
        <div className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Open in AniList
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={cn("text-xs font-medium", STATUS_COLORS.get(entry.status))}
          >
            {entry.status.replace('-', ' ')}
          </Badge>
          
          {entry.rating && (
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs text-muted-foreground font-medium">{entry.rating}/10</span>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground font-medium">
          {progressText}
        </div>

        {entry.genre.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.genre.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs px-2 py-0.5 font-medium">
                {genre}
              </Badge>
            ))}
            {entry.genre.length > 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium">
                +{entry.genre.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
}

export default MediaCard;