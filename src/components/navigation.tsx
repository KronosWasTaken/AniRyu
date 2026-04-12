import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlayCircle, BookOpen, Plus, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Anime', icon: PlayCircle },
    { path: '/manga', label: 'Manga', icon: BookOpen },
    { path: '/add', label: 'Add Entry', icon: Plus },
    { path: '/import', label: 'Import', icon: Download },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-red-500/20 fixed top-0 left-0 right-0 z-50 h-14 sm:h-16">
      <div className="container mx-auto px-3 sm:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          <Link
            to="/"
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-90 transition-opacity"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
              <img 
                src="/aniryu.png" 
                alt="AniRyu Logo" 
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
              />
            </div>
            <h1 className="text-sm sm:text-lg font-semibold text-foreground tracking-tight font-sora">
              AniRyu {/* Force refresh - v2 */}
            </h1>
          </Link>
          
          <div className="flex items-center space-x-1 overflow-x-auto flex-1 justify-end ml-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm font-medium shrink-0",
                    isActive 
                      ? "bg-red-500 text-black shadow-xs" 
                      : "hover:bg-red-500/10 hover:text-red-500"
                  )}
                >
                  <Link to={item.path} className="flex items-center space-x-1 sm:space-x-2">
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;