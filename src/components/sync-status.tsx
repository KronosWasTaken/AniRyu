import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncStatusProps {
  lastSync?: Date;
  isOnline?: boolean;
  onRefresh?: () => void;
}

function SyncStatus({ lastSync, isOnline = true, onRefresh }: SyncStatusProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastSync) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastSync.getTime();
      
      if (diff < 60000) { // Less than 1 minute
        setTimeAgo('Just now');
      } else if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        setTimeAgo(`${minutes}m ago`);
      } else if (diff < 86400000) { // Less than 1 day
        const hours = Math.floor(diff / 3600000);
        setTimeAgo(`${hours}h ago`);
      } else {
        const days = Math.floor(diff / 86400000);
        setTimeAgo(`${days}d ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastSync]);

  if (!lastSync) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Not loaded</span>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center space-x-1 text-primary hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Load now</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={cn(
        "flex items-center space-x-1",
        isOnline ? "text-green-600" : "text-red-600"
      )}>
        {isOnline ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <AlertCircle className="w-4 h-4" />
        )}
        <span>{isOnline ? 'Connected' : 'Offline'}</span>
      </div>
      
      <span className="text-muted-foreground">
        {timeAgo}
      </span>
      
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="flex items-center space-x-1 text-primary hover:underline"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      )}
    </div>
  );
}

export default SyncStatus;
