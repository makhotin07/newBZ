import api from '../../shared/api';

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Block {
  id: string;
  type: string;
  content: any;
  position: number;
  parent_block?: string;
  children?: Block[];
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  title: string;
  content: any;
  content_text: string;
  icon?: string;
  cover_image?: string;
  workspace: string;
  workspace_name: string;
  parent?: string;
  author: string;
  author_name: string;
  last_edited_by: string;
  last_edited_by_name: string;
  tags: Tag[];
  permissions: 'private' | 'workspace' | 'public';
  is_template: boolean;
  is_archived: boolean;
  position: number;
  blocks?: Block[];
  children?: Page[];
  path: string;
  created_at: string;
  updated_at: string;
}



export interface CreatePageData {
  title: string;
  content?: any;
  icon?: string;
  cover_image?: string;
  workspace: string;
  parent?: string;
  tag_ids?: string[];
  permissions?: 'private' | 'workspace' | 'public';
  is_template?: boolean;
  position?: number;
}

export interface UpdatePageData {
  title?: string;
  content?: any;
  icon?: string;
  cover_image?: string;
  parent?: string;
  tag_ids?: string[];
  permissions?: 'private' | 'workspace' | 'public';
  is_template?: boolean;
  is_archived?: boolean;
  position?: number;
}

export interface PageVersion {
  id: string;
  page: string;
  title: string;
  content: any;
  content_text: string;
  version_number: number;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

class NotesApi {
  // Tags
  async getTags(): Promise<Tag[]> {
    try {
      const response = await api.get('/notes/tags/');
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }

  async createTag(name: string, color: string = '#6B7280'): Promise<Tag> {
    const response = await api.post('/notes/tags/', { name, color });
    return response.data;
  }

  async updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
    const response = await api.patch(`/notes/tags/${id}/`, updates);
    return response.data;
  }

  async deleteTag(id: string): Promise<void> {
    await api.delete(`/notes/tags/${id}/`);
  }

  // Pages
  async getPages(params?: {
    workspace?: string;
    parent?: string | 'null';
    archived?: boolean;
    templates?: boolean;
  }): Promise<Page[]> {
    try {
      const response = await api.get('/notes/pages/', { params });
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching pages:', error);
      return [];
    }
  }

  async getPage(id: string): Promise<Page> {
    const response = await api.get(`/notes/pages/${id}/`);
    return response.data;
  }

  async createPage(data: {
    title: string;
    content?: any;
    icon?: string;
    cover_image?: string;
    workspace: string;
    parent?: string;
    tag_ids?: string[];
    permissions?: 'private' | 'workspace' | 'public';
    is_template?: boolean;
    position?: number;
  }): Promise<Page> {
    const response = await api.post('/notes/pages/', data);
    return response.data;
  }

  async updatePage(id: string, data: {
    title?: string;
    content?: any;
    icon?: string;
    cover_image?: string;
    parent?: string;
    tag_ids?: string[];
    permissions?: 'private' | 'workspace' | 'public';
    is_template?: boolean;
    is_archived?: boolean;
    position?: number;
  }): Promise<Page> {
    const response = await api.patch(`/notes/pages/${id}/`, data);
    return response.data;
  }

  async deletePage(id: string): Promise<void> {
    await api.delete(`/notes/pages/${id}/`);
  }

  // Blocks
  async getPageBlocks(pageId: string): Promise<Block[]> {
    try {
      const response = await api.get(`/notes/pages/${pageId}/blocks/`);
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching page blocks:', error);
      return [];
    }
  }

  async createBlock(pageId: string, blockData: {
    type: string;
    content: any;
    position?: number;
    parent_block?: string;
  }): Promise<Block> {
    const response = await api.post(`/notes/pages/${pageId}/blocks/`, blockData);
    return response.data;
  }

  async updateBlock(blockId: string, updates: {
    type?: string;
    content?: any;
    position?: number;
  }): Promise<Block> {
    const response = await api.patch(`/notes/blocks/${blockId}/`, updates);
    return response.data;
  }

  async deleteBlock(blockId: string): Promise<void> {
    await api.delete(`/notes/blocks/${blockId}/`);
  }

  // Database Blocks
  async createDatabaseBlock(pageId: string, databaseId: string, viewId?: string): Promise<Block> {
    const blockData = {
      type: 'database',
      content: {
        database_id: databaseId,
        view_id: viewId,
      },
      position: 0, // Будет автоматически установлено сервером
    };
    
    return this.createBlock(pageId, blockData);
  }

  async updateDatabaseBlock(blockId: string, databaseId: string, viewId?: string): Promise<Block> {
    const updates = {
      content: {
        database_id: databaseId,
        view_id: viewId,
      },
    };
    
    return this.updateBlock(blockId, updates);
  }



  // Page Management
  async getRecentPages(workspaceId: string, limit: number = 10): Promise<Page[]> {
    try {
      const response = await api.get(`/notes/workspace/${workspaceId}/recent/`, { 
        params: { limit } 
      });
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching recent pages:', error);
      return [];
    }
  }

  async sharePage(data: { page_id: string; share_type: 'public' | 'private'; public_access: boolean }): Promise<any> {
    const response = await api.post(`/notes/pages/${data.page_id}/share/`, data);
    return response.data;
  }

  async getPageShares(pageId: string): Promise<any[]> {
    try {
      const response = await api.get(`/notes/pages/${pageId}/shares/`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching page shares:', error);
      return [];
    }
  }

  async archivePage(id: string): Promise<Page> {
    const response = await api.patch(`/notes/pages/${id}/archive/`);
    return response.data;
  }

  async duplicatePage(id: string): Promise<Page> {
    const response = await api.post(`/notes/pages/${id}/duplicate/`);
    return response.data;
  }

  async getPageChildren(pageId: string): Promise<Page[]> {
    try {
      const response = await api.get(`/notes/pages/${pageId}/children/`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching page children:', error);
      return [];
    }
  }

  async getPageVersions(pageId: string): Promise<PageVersion[]> {
    try {
      const response = await api.get(`/notes/pages/${pageId}/versions/`);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching page versions:', error);
      return [];
    }
  }

  // Search
  async searchPages(query: string, params?: {
    workspace?: string;
  }): Promise<{ pages: Page[]; count: number; query: string }> {
    try {
      const response = await api.get('/notes/pages/search/', {
        params: { q: query, ...params }
      });
      if (response.data && typeof response.data === 'object') {
        return response.data;
      }
      return { pages: [], count: 0, query };
    } catch (error) {
      console.error('Error searching pages:', error);
      return { pages: [], count: 0, query };
    }
  }
}

export const notesApi = new NotesApi();
