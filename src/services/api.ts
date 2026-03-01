const ENV_API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3001/api'
  : typeof window !== 'undefined'
    ? `${window.location.origin}/api`
    : '/api';

export const API_BASE_URL = ENV_API_BASE_URL || DEFAULT_API_BASE_URL;

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const animeApi = {
  async getList() {
    return apiRequest('/list/anime');
  },

  async addMedia(mediaId: number, mediaType: string, formData?: any) {
    const payload: any = { media_id: mediaId, media_type: mediaType };
    
    if (formData) {
      payload.status = formData.status;
      payload.rating = formData.rating ? parseInt(formData.rating) : 0;
      payload.progress = formData.progress ? parseInt(formData.progress) : 0;
      payload.notes = formData.notes || '';
      payload.hidden_from_status_lists = formData.hiddenFromStatusLists || false;
    }
    
    return apiRequest('/add_media', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateEntry(mediaId: number, progress: number, score: number, status: string) {
    return apiRequest(`/list/anime/${mediaId}`, {
      method: 'PUT',
      body: JSON.stringify({ progress, score, status }),
    });
  },

  async deleteEntry(mediaId: number) {
    return apiRequest(`/list/anime/${mediaId}`, {
      method: 'DELETE',
    });
  },

  async editEntry(mediaId: number, updates: any) {
    return apiRequest(`/anime/${mediaId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async addManualMedia(payload: any) {
    return apiRequest('/manual_media', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async permanentlyDelete(mediaId: number) {
    return apiRequest('/anime/permanent', {
      method: 'DELETE',
      body: JSON.stringify({ media_id: mediaId }),
    });
  },
};

export const mangaApi = {
  async getList() {
    return apiRequest('/list/manga');
  },

  async addMedia(mediaId: number, mediaType: string, formData?: any) {
    const payload: any = { media_id: mediaId, media_type: mediaType };
    
    if (formData) {
      payload.status = formData.status;
      payload.rating = formData.rating ? parseInt(formData.rating) : 0;
      payload.progress = formData.progress ? parseInt(formData.progress) : 0;
      payload.notes = formData.notes || '';
      payload.hidden_from_status_lists = formData.hiddenFromStatusLists || false;
    }
    
    return apiRequest('/add_media', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateEntry(mediaId: number, progress: number, score: number, status: string) {
    return apiRequest(`/list/manga/${mediaId}`, {
      method: 'PUT',
      body: JSON.stringify({ progress, score, status }),
    });
  },

  async deleteEntry(mediaId: number) {
    return apiRequest(`/list/manga/${mediaId}`, {
      method: 'DELETE',
    });
  },

  async editEntry(mediaId: number, updates: any) {
    return apiRequest(`/manga/${mediaId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async addManualMedia(payload: any) {
    return apiRequest('/manual_media', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async permanentlyDelete(mediaId: number) {
    return apiRequest('/manga/permanent', {
      method: 'DELETE',
      body: JSON.stringify({ media_id: mediaId }),
    });
  },
};

export const searchApi = {
  async search(query: string) {
    return apiRequest(`/search?query=${encodeURIComponent(query)}`);
  },
  
  async checkExists(mediaId: number, type: 'anime' | 'manga') {
    return apiRequest(`/check_exists?media_id=${mediaId}&type=${type}`);
  },
};

export const adminApi = {
  async resetDatabase() {
    return apiRequest('/reset', {
      method: 'DELETE',
    });
  },
};

export const healthApi = {
  async check() {
    return apiRequest('/health');
  },
};
