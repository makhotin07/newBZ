import api from './api';

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

export interface PageVersion {
  id: string;
  version_number: number;
  title: string;
  content: any;
  content_text: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  author_name: string;
  author_avatar?: string;
  parent?: string;
  block?: string;
  is_resolved: boolean;
  replies: Comment[];
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

export interface SearchResult {
  pages: Page[];
  count: number;
  query: string;
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

  async createPage(data: CreatePageData): Promise<Page> {
    const response = await api.post('/notes/pages/', data);
    return response.data;
  }

  async updatePage(id: string, data: UpdatePageData): Promise<Page> {
    const response = await api.patch(`/notes/pages/${id}/`, data);
    return response.data;
  }

  async deletePage(id: string): Promise<void> {
    await api.delete(`/notes/pages/${id}/`);
  }

  async archivePage(id: string): Promise<Page> {
    const response = await api.post(`/notes/pages/${id}/archive/`);
    return response.data;
  }

  async duplicatePage(id: string): Promise<Page> {
    const response = await api.post(`/notes/pages/${id}/duplicate/`);
    return response.data;
  }

  async getPageChildren(id: string): Promise<Page[]> {
    try {
      const response = await api.get(`/notes/pages/${id}/children/`);
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching page children:', error);
      return [];
    }
  }

  // Page Versions
  async getPageVersions(pageId: string): Promise<PageVersion[]> {
    try {
      const response = await api.get(`/notes/pages/${pageId}/versions/`);
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching page versions:', error);
      return [];
    }
  }

  async restorePageVersion(pageId: string, version: PageVersion): Promise<Page> {
    const response = await api.patch(`/notes/pages/${pageId}/`, {
      title: version.title,
      content: version.content,
    });
    return response.data;
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

  // Comments
  async getPageComments(pageId: string): Promise<Comment[]> {
    try {
      const response = await api.get(`/notes/pages/${pageId}/comments/`);
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching page comments:', error);
      return [];
    }
  }

  async createComment(pageId: string, commentData: {
    content: string;
    parent?: string;
    block?: string;
  }): Promise<Comment> {
    const response = await api.post(`/notes/pages/${pageId}/comments/`, commentData);
    return response.data;
  }

  async updateComment(commentId: string, content: string): Promise<Comment> {
    const response = await api.patch(`/notes/comments/${commentId}/`, { content });
    return response.data;
  }

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/notes/comments/${commentId}/`);
  }

  async resolveComment(commentId: string, resolved: boolean = true): Promise<Comment> {
    const response = await api.patch(`/notes/comments/${commentId}/`, { 
      is_resolved: resolved 
    });
    return response.data;
  }

  // Search
  async searchPages(query: string, params?: {
    workspace?: string;
  }): Promise<SearchResult> {
    try {
      const response = await api.get('/notes/search/', {
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

  // Recent pages
  async getRecentPages(workspaceId: string, limit: number = 5): Promise<Page[]> {
    try {
      const response = await api.get('/notes/pages/', {
        params: { 
          workspace: workspaceId, 
          ordering: '-updated_at',
          page_size: limit 
        }
      });
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching recent pages:', error);
      return [];
    }
  }

  // Utilities
  async uploadImage(file: File): Promise<string> {
    // TODO: Implement when backend endpoint is ready
    console.log('uploadImage called with file:', file.name);
    return 'https://via.placeholder.com/300x200?text=Image+Upload+Coming+Soon';
  }

  // Real-time collaboration helpers
  async getCurrentCollaborators(pageId: string): Promise<any[]> {
    // TODO: Implement when backend endpoint is ready
    console.log('getCurrentCollaborators called for page:', pageId);
    return [];
  }

  // Page sharing
  async sharePage(data: { page_id: string; share_type?: 'public' | 'private' | 'workspace'; public_access?: boolean }): Promise<any> {
    const response = await api.post(`/notes/pages/${data.page_id}/share/`, data);
    return response.data;
  }

  async getPageShares(pageId: string): Promise<any> {
    const response = await api.get(`/notes/pages/${pageId}/shares/`);
    return response.data;
  }
}

export const notesApi = new NotesApi();
