import api from './api';

// Search interfaces
export interface SearchFilters {
  tags?: string[];
  category?: string;
  created_after?: string;
  created_before?: string;
  author?: string;
  status?: string[];
  priority?: string[];
  assigned_to?: string[];
  due_date_after?: string;
  due_date_before?: string;
}

export interface SearchRequest {
  query?: string;
  search_type?: 'all' | 'pages' | 'tasks' | 'databases' | 'users';
  workspace_id?: string;
  filters?: SearchFilters;
  page?: number;
  page_size?: number;
  sort_by?: 'relevance' | 'created_at' | 'updated_at' | 'title';
  sort_order?: 'asc' | 'desc';
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  content_type: string;
  url: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  metadata?: Record<string, any>;
  highlight?: {
    fragment: string;
    full_content: string;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next?: boolean;
  search_time?: number;
}

export interface AutocompleteSuggestion {
  value: string;
  label: string;
  type: 'history' | 'tag' | 'page' | 'user';
  count?: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  search_type: string;
  results_count: number;
  created_at: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  search_type: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuickSearchResults {
  pages: SearchResult[];
  tasks: SearchResult[];
  databases: SearchResult[];
}

export interface SearchSuggestions {
  popular_queries: { query: string; count: number }[];
  popular_tags: { name: string; count: number }[];
}

// Search API functions
export const searchApi = {
  // Main search
  search: async (searchRequest: SearchRequest): Promise<SearchResponse> => {
    const response = await api.post('/search/search/', searchRequest);
    return response.data;
  },

  // Quick search for global search bar
  quickSearch: async (query: string, workspace_id?: string): Promise<QuickSearchResults> => {
    const response = await api.post('/quick-search/', {
      query,
      workspace_id,
    });
    return response.data;
  },

  // Autocomplete suggestions
  getAutocomplete: async (query: string, workspace_id?: string, limit: number = 10): Promise<AutocompleteSuggestion[]> => {
    const response = await api.get('/search/autocomplete/', {
      params: {
        q: query,
        workspace_id,
        limit,
      },
    });
    return response.data;
  },

  // Search suggestions (popular queries and tags)
  getSearchSuggestions: async (workspace_id?: string): Promise<SearchSuggestions> => {
    const response = await api.get('/suggestions/', {
      params: { workspace_id },
    });
    return response.data;
  },

  // Search history
  getSearchHistory: async (workspace_id?: string): Promise<SearchHistory[]> => {
    const response = await api.get('/search-history/', {
      params: { workspace_id },
    });
    return response.data;
  },

  clearSearchHistory: async (workspace_id?: string): Promise<void> => {
    await api.delete('/search-history/clear/', {
      params: { workspace_id },
    });
  },

  // Saved searches
  getSavedSearches: async (workspace_id?: string): Promise<SavedSearch[]> => {
    const response = await api.get('/saved-searches/', {
      params: { workspace_id },
    });
    return response.data;
  },

  createSavedSearch: async (data: Partial<SavedSearch> & { workspace_id?: string }): Promise<SavedSearch> => {
    const response = await api.post('/saved-searches/', data);
    return response.data;
  },

  updateSavedSearch: async (id: string, data: Partial<SavedSearch>): Promise<SavedSearch> => {
    const response = await api.patch(`/saved-searches/${id}/`, data);
    return response.data;
  },

  deleteSavedSearch: async (id: string): Promise<void> => {
    await api.delete(`/saved-searches/${id}/`);
  },

  executeSavedSearch: async (id: string, page?: number, page_size?: number): Promise<SearchResponse> => {
    const response = await api.post(`/saved-searches/${id}/execute/`, {}, {
      params: { page, page_size },
    });
    return response.data;
  },
};

export default searchApi;
