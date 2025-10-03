import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animeApi, mangaApi } from '@/services/api';
import { AnimeEntry, MangaEntry } from '@/types';
import { useToast } from './use-toast';

export function useAnimeApi() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: animeList = [], isLoading, error, refetch } = useQuery({
    queryKey: ['animeList'],
    queryFn: async () => {
      const response = await animeApi.getList();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: animeApi.deleteEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animeList'] });
      toast({
        title: "Anime Deleted",
        description: "Anime entry removed successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error deleting anime",
        description: err.response?.data?.details || err.message,
        variant: "destructive",
      });
    },
  });

  return {
    animeList,
    isLoading,
    error: error ? String(error) : null,
    deleteAnime: deleteMutation.mutateAsync,
    refresh: refetch,
  };
}

export function useMangaApi() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: mangaList = [], isLoading, error, refetch } = useQuery({
    queryKey: ['mangaList'],
    queryFn: async () => {
      const response = await mangaApi.getList();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: mangaApi.deleteEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mangaList'] });
      toast({
        title: "Manga Deleted",
        description: "Manga entry removed successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error deleting manga",
        description: err.response?.data?.details || err.message,
        variant: "destructive",
      });
    },
  });

  return {
    mangaList,
    isLoading,
    error: error ? String(error) : null,
    deleteManga: deleteMutation.mutateAsync,
    refresh: refetch,
  };
}
