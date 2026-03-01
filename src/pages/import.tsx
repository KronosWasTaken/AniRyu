import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Download, CheckCircle, AlertCircle, ExternalLink, Trash2, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { API_BASE_URL, adminApi } from '@/services/api';
import { useAnimeApi, useMangaApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';

interface ImportProgress {
  type: string;
  current: number;
  total: number;
  title: string;
  status: string;
  message: string;
}

function Import() {
  const [username, setUsername] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const { animeList } = useAnimeApi();
  const { mangaList } = useMangaApi();
  const { toast } = useToast();

  const handleImport = async () => {
    if (!username.trim()) {
      setImportResult({
        success: false,
        message: 'Please enter a valid AniList username',
      });
      return;
    }

    setIsImporting(true);
    setImportResult(null);
    setProgress(null);
    setProgressLog([]);

    try {
      const response = await fetch(`${API_BASE_URL}/import/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start import');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read response stream');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setProgress(data);
              
              if (data.message) {
                setProgressLog(prev => [...prev, data.message]);
              }

              if (data.status === 'completed') {
                setImportResult({
                  success: true,
                  message: `Successfully imported ${username}'s AniList data!`,
                });
                setUsername('');
              } else if (data.status === 'error') {
                throw new Error(data.message);
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error.';
      const friendlyMessage = /network/i.test(message)
        ? 'Backend is offline — start the server and refresh.'
        : message;
      setImportResult({
        success: false,
        message: friendlyMessage,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isImporting) {
      handleImport();
    }
  };

  const formatCsvValue = (value: string | number | null | undefined) => {
    const safeValue = value ?? '';
    const stringValue = String(safeValue);
    if (/[,\n"]/u.test(stringValue)) {
      return `"${stringValue.replace(/"/gu, '""')}"`;
    }
    return stringValue;
  };

  const buildCsv = (rows: { name: string; score: number | string; status: string }[]) => {
    const header = ['name', 'score', 'status'];
    const lines = rows.map((row) => [
      formatCsvValue(row.name),
      formatCsvValue(row.score),
      formatCsvValue(row.status),
    ].join(','));
    return [header.join(','), ...lines].join('\n');
  };

  const downloadCsv = (rows: { name: string; score: number | string; status: string }[], filename: string) => {
    const csv = buildCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const statusOrder = new Map<string, number>([
    ['watching', 1],
    ['completed', 2],
    ['on-hold', 3],
    ['dropped', 4],
    ['plan-to-watch', 5],
    ['reading', 1],
    ['plan-to-read', 5],
  ]);

  const sortByStatusOrder = (a: { status?: string }, b: { status?: string }) => {
    const aOrder = statusOrder.get(a.status ?? '') ?? Number.MAX_SAFE_INTEGER;
    const bOrder = statusOrder.get(b.status ?? '') ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return String(a.status ?? '').localeCompare(String(b.status ?? ''));
  };

  const handleExportAnime = () => {
    if (!Array.isArray(animeList)) return;
    const rows = [...animeList]
      .sort(sortByStatusOrder)
      .map((anime: any) => ({
        name: anime.title,
        score: anime.score ?? '',
        status: anime.status ?? '',
      }));
    downloadCsv(rows, 'anime-scores.csv');
  };

  const handleExportManga = () => {
    if (!Array.isArray(mangaList)) return;
    const rows = [...mangaList]
      .sort(sortByStatusOrder)
      .map((manga: any) => ({
        name: manga.title,
        score: manga.score ?? '',
        status: manga.status ?? '',
      }));
    downloadCsv(rows, 'manga-scores.csv');
  };

  const handleResetDatabase = async () => {
    setIsResetting(true);
    const response = await adminApi.resetDatabase();
    if (response.error) {
      toast({
        title: 'Reset failed',
        description: response.error,
        variant: 'destructive',
      });
      setIsResetting(false);
      return;
    }

    toast({
      title: 'Database cleared',
      description: 'Your anime and manga lists were removed. Re-import to restore data.',
    });
    setIsResetting(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
      className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6"
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2 font-sora">
              <Download className="w-8 h-8" />
              Import from AniList
            </CardTitle>
            <CardDescription>
              Import your anime and manga lists from AniList to get started with AniRyu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  AniList Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your AniList username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isImporting}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Don't have an AniList account?{' '}
                  <a
                    href="https://anilist.co/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Create one here <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              <Button
                onClick={handleImport}
                disabled={isImporting || !username.trim()}
                className="w-full"
                size="lg"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Import My Lists
                  </>
                )}
              </Button>
            </div>

            {/* Progress Display */}
            {isImporting && progress && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      Importing {progress.type === 'combined' ? 'Anime & Manga' : progress.type === 'ANIME' ? 'Anime' : progress.type === 'MANGA' ? 'Manga' : 'Data'}...
                    </span>
                    <span className="text-muted-foreground">
                      {progress.current}/{progress.total}
                    </span>
                  </div>
                  <Progress 
                    value={(progress.current / progress.total) * 100} 
                    className="w-full"
                  />
                  {progress.title && (
                    <p className="text-sm text-muted-foreground">
                      Currently importing: <span className="font-medium">{progress.title}</span>
                    </p>
                  )}
                </div>

                {/* Progress Log */}
                {progressLog.length > 0 && (
                  <div className="bg-muted/50 p-3 rounded-lg max-h-32 overflow-y-auto">
                    <div className="text-xs font-medium mb-2">Import Progress:</div>
                    <div className="space-y-1">
                      {progressLog.slice(-5).map((log, index) => (
                        <div key={index} className="text-xs text-muted-foreground">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {importResult && (
              <Alert className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {importResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription className={importResult.success ? 'text-green-800' : 'text-red-800'}>
                  {importResult.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="border border-border/60 rounded-lg p-4 space-y-4 bg-card/60">
              <div className="space-y-1">
                <h3 className="font-semibold">Data Management</h3>
                <p className="text-sm text-muted-foreground">
                  Export your lists or clear all local data before a fresh import.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" size="sm" onClick={handleExportAnime}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export Anime CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportManga}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export Manga CSV
                </Button>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full sm:w-auto" disabled={isResetting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isResetting ? 'Deleting...' : 'Delete Database'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete all data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all anime and manga entries from AniRyu. You can re-import from AniList afterward.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleResetDatabase}
                    >
                      Delete Database
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What gets imported?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Your anime list with status, progress, and ratings</li>
                <li>• Your manga list with status, progress, and ratings</li>
                <li>• Cover images and basic information</li>
                <li>• Your personal notes and scores</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold mb-2 text-blue-900">Privacy Note</h3>
              <p className="text-sm text-blue-800">
                We only import your public list data from AniList. Your private entries and personal information are not accessed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export default Import;
