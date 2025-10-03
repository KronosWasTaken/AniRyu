import { Button } from '@/components/ui/button';
import { Download, BookOpen, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  type: 'anime' | 'manga';
}

function EmptyState({ type }: EmptyStateProps) {
  const isAnime = type === 'anime';
  const Icon = isAnime ? PlayCircle : BookOpen;
  const title = isAnime ? 'No Anime Yet' : 'No Manga Yet';
  const description = isAnime 
    ? "You haven't added any anime to your list yet. Import from AniList to get started!"
    : "You haven't added any manga to your list yet. Import from AniList to get started!";

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon className="w-12 h-12 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg">
          <Link to="/import" className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Import from AniList</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" size="lg">
          <Link to="/add" className="flex items-center space-x-2">
            <Icon className="w-5 h-5" />
            <span>Add Manually</span>
          </Link>
        </Button>
      </div>
      
      <div className="mt-6 text-sm text-muted-foreground">
        <p>Don't have an AniList account?{' '}
          <a
            href="https://anilist.co/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Create one here
          </a>
        </p>
      </div>
    </div>
  );
}

export default EmptyState;
