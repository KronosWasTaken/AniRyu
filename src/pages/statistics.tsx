import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  PieChart, 
  Star,
  Clock,
  BookOpen,
  Tv,
  Award,
  RefreshCw
} from 'lucide-react';
import { useAnimeApi, useMangaApi } from '@/hooks/use-api';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
}

function StatCard({ title, value, subtitle, icon, color = 'blue' }: StatCardProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn("p-2 rounded-lg", `bg-${color}-100 dark:bg-${color}-900/20`)}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

function ProgressBar({ label, value, max, color = 'blue' }: ProgressBarProps) {
  // Ensure we don't exceed 100% and handle edge cases
  const safeMax = Math.max(max, 1); // Prevent division by zero
  const cappedValue = Math.min(value, safeMax);
  const percentage = Math.min((cappedValue / safeMax) * 100, 100);
  
  // Format large numbers with commas
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return num.toString();
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {formatNumber(cappedValue)}/{formatNumber(safeMax)}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className={cn("h-2 rounded-full", `bg-${color}-500`)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
      {value > max && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          * Progress exceeds available episodes/chapters
        </p>
      )}
    </div>
  );
}

function Statistics() {
  const { animeList, isLoading: animeLoading } = useAnimeApi();
  const { mangaList, isLoading: mangaLoading } = useMangaApi();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = useMemo(() => {
    if (!animeList || !mangaList || !Array.isArray(animeList) || !Array.isArray(mangaList)) return null;

    // Basic counts
    const totalAnime = animeList.length;
    const totalManga = mangaList.length;
    const totalMedia = totalAnime + totalManga;

    // Status breakdown
    const animeStatusCounts = animeList.reduce((acc: any, anime: any) => {
      acc[anime.status] = (acc[anime.status] || 0) + 1;
      return acc;
    }, {});

    const mangaStatusCounts = mangaList.reduce((acc: any, manga: any) => {
      acc[manga.status] = (acc[manga.status] || 0) + 1;
      return acc;
    }, {});

    // Score statistics
    const animeWithScores = animeList.filter((anime: any) => anime.score > 0);
    const mangaWithScores = mangaList.filter((manga: any) => manga.score > 0);
    const avgAnimeScore = animeWithScores.length > 0 
      ? (animeWithScores.reduce((sum: number, anime: any) => sum + anime.score, 0) / animeWithScores.length).toFixed(1)
      : 0;
    const avgMangaScore = mangaWithScores.length > 0 
      ? (mangaWithScores.reduce((sum: number, manga: any) => sum + manga.score, 0) / mangaWithScores.length).toFixed(1)
      : 0;

    // Progress statistics
    const totalEpisodesWatched = animeList.reduce((sum: number, anime: any) => sum + (anime.progress || 0), 0);
    const totalChaptersRead = mangaList.reduce((sum: number, manga: any) => sum + (manga.progress || 0), 0);
    const totalEpisodesAvailable = animeList.reduce((sum: number, anime: any) => sum + (anime.total || 0), 0);
    const totalChaptersAvailable = mangaList.reduce((sum: number, manga: any) => sum + (manga.total || 0), 0);
    
    // Cap the progress values to prevent overflow
    const cappedEpisodesWatched = Math.min(totalEpisodesWatched, totalEpisodesAvailable);
    const cappedChaptersRead = Math.min(totalChaptersRead, totalChaptersAvailable);

    // Completion rates
    const completedAnime = animeStatusCounts.completed || 0;
    const completedManga = mangaStatusCounts.completed || 0;
    const animeCompletionRate = totalAnime > 0 ? ((completedAnime / totalAnime) * 100).toFixed(1) : 0;
    const mangaCompletionRate = totalManga > 0 ? ((completedManga / totalManga) * 100).toFixed(1) : 0;

    // Time estimates (rough calculations)
    const estimatedAnimeTime = cappedEpisodesWatched * 24; // 24 minutes per episode
    const estimatedMangaTime = cappedChaptersRead * 5; // 5 minutes per chapter
    const totalTimeHours = Math.round((estimatedAnimeTime + estimatedMangaTime) / 60);

    return {
      totalAnime,
      totalManga,
      totalMedia,
      animeStatusCounts,
      mangaStatusCounts,
      avgAnimeScore,
      avgMangaScore,
      totalEpisodesWatched: cappedEpisodesWatched,
      totalChaptersRead: cappedChaptersRead,
      totalEpisodesAvailable,
      totalChaptersAvailable,
      completedAnime,
      completedManga,
      animeCompletionRate,
      mangaCompletionRate,
      totalTimeHours
    };
  }, [animeList, mangaList]);

  if (animeLoading || mangaLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Statistics</h1>
          <p className="text-muted-foreground">No data available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Statistics</h1>
          <p className="text-muted-foreground mt-1">
            Insights about your anime and manga collection
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Media"
          value={stats.totalMedia}
          subtitle={`${stats.totalAnime} anime, ${stats.totalManga} manga`}
          icon={<BookOpen className="w-5 h-5 text-blue-600" />}
          color="blue"
        />
         <StatCard
           title="Completed"
           value={stats.completedAnime + stats.completedManga}
           subtitle={`${stats.animeCompletionRate}% anime, ${stats.mangaCompletionRate}% manga`}
           icon={<Award className="w-5 h-5 text-green-600" />}
           color="green"
         />
        <StatCard
          title="Average Score"
          value={`${stats.avgAnimeScore}/10`}
          subtitle={`Anime: ${stats.avgAnimeScore}, Manga: ${stats.avgMangaScore}`}
          icon={<Star className="w-5 h-5 text-yellow-600" />}
          color="yellow"
        />
        <StatCard
          title="Time Invested"
          value={`${stats.totalTimeHours}h`}
          subtitle="Estimated total watch/read time"
          icon={<Clock className="w-5 h-5 text-purple-600" />}
          color="purple"
        />
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="anime">Anime</TabsTrigger>
          <TabsTrigger value="manga">Manga</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.animeStatusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="capitalize">{status.replace('-', ' ')}</span>
                    </div>
                    <Badge variant="secondary">{count as number}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressBar
                  label="Episodes Watched"
                  value={stats.totalEpisodesWatched}
                  max={stats.totalEpisodesAvailable || 1}
                  color="blue"
                />
                <ProgressBar
                  label="Chapters Read"
                  value={stats.totalChaptersRead}
                  max={stats.totalChaptersAvailable || 1}
                  color="green"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tv className="w-5 h-5 mr-2" />
                  Anime Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalAnime}</div>
                    <div className="text-sm text-muted-foreground">Total Anime</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.completedAnime}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Completion Rate</span>
                    <span className="font-medium">{stats.animeCompletionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.animeCompletionRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.animeStatusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{status.replace('-', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(count as number / stats.totalAnime) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manga" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Manga Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalManga}</div>
                    <div className="text-sm text-muted-foreground">Total Manga</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.completedManga}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Completion Rate</span>
                    <span className="font-medium">{stats.mangaCompletionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.mangaCompletionRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.mangaStatusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{status.replace('-', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${(count as number / stats.totalManga) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{count as number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export default Statistics;
