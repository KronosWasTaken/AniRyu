import { motion } from 'motion/react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  count?: number;
  layout?: 'grid' | 'list';
}

export function LoadingSkeleton({ count = 10, layout = 'grid' }: LoadingSkeletonProps) {
  if (layout === 'list') {
    return (
      <div className="bg-card/50 rounded-lg border border-red-500/20">
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.02, duration: 0.3 }}
            className="flex items-center p-4 border-b border-red-500/20 last:border-b-0"
          >
            <Skeleton className="w-12 h-12 rounded-md mr-4" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <div className="w-24 mr-4">
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="w-16 mr-4">
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="w-12">
              <Skeleton className="h-4 w-full" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02, duration: 0.3 }}
          className="bg-card rounded-lg border border-red-500/20 overflow-hidden shadow-lg hover:shadow-red-500/25 hover:shadow-xl transition-all duration-200"
        >
          <Skeleton className="w-full h-64" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
