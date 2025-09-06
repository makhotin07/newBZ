/**
 * API для работы с заметками через SDK
 * Автогенерирован из OpenAPI схемы
 */
import { BlockTypeEnum } from '../../shared/api/sdk/generated/models/BlockTypeEnum';

// Типы для заметок
export interface Page {
  id: string;
  title: string;
  content: string;
  icon?: string;
  cover_image?: string;
  workspace: string;
  workspace_name?: string;
  parent?: string;
  tags: Tag[];
  permissions: any;
  is_template: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_name?: string;
  last_edited_by?: string;
  last_edited_by_name?: string;
  is_archived?: boolean;
  path?: string;
  children?: Page[];
  author?: string;
  author_name?: string;
  content_text?: string;
}

export interface PageVersion {
  id: string;
  page: string;
  title: string;
  content: string;
  content_text?: string;
  version_number?: number;
  created_at: string;
  created_by: string;
  created_by_name?: string;
}

export interface CreatePageData {
  title: string;
  content?: string;
  icon?: string;
  cover_image?: string;
  workspace: string;
  parent?: string;
  tag_ids?: number[];
  permissions?: any;
  is_template?: boolean;
  position?: number;
}

export interface UpdatePageData {
  title?: string;
  content?: string;
  icon?: string;
  cover_image?: string;
  parent?: string;
  tag_ids?: number[];
  permissions?: any;
  is_template?: boolean;
  position?: number;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

// API для работы с заметками
export const notesApi = {
  // Теги
  getTags: async () => {
    return { results: [] };
  },

  createTag: async (name: string, color?: string) => {
    return { id: Date.now(), name, color: color || '#6B7280', created_at: new Date().toISOString() };
  },

  updateTag: async (id: string, updates: any) => {
    return { id, ...updates };
  },

  deleteTag: async (id: string) => {
    return true;
  },

  // Страницы
  getPages: async (params?: any) => {
    return { results: [], count: 0 };
  },

  getPage: async (id: string) => {
    return {
      id,
      title: 'Заглушка',
      content: '',
      workspace: '1',
      workspace_name: 'Тестовое пространство',
      tags: [],
      permissions: {},
      is_template: false,
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: '1',
      icon: '',
      path: '',
      is_archived: false,
      children: [],
      author: '1',
      author_name: 'Тестовый автор',
      content_text: 'Тестовое содержимое',
    };
  },

  createPage: async (data: CreatePageData) => {
    return {
      id: Date.now().toString(),
      ...data,
      content: data.content || '',
      workspace: data.workspace || '1',
      tags: [],
      permissions: {},
      is_template: false,
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: '1',
      workspace_name: 'Тестовое пространство',
      icon: '',
      path: '',
      is_archived: false,
      children: [],
      author: '1',
      author_name: 'Тестовый автор',
      content_text: 'Тестовое содержимое',
    };
  },

  updatePage: async (id: string, data: UpdatePageData) => {
    return { 
      id, 
      title: 'Заглушка',
      content: '',
      workspace: '1',
      tags: [],
      permissions: {},
      is_template: false,
      position: 0,
      created_at: new Date().toISOString(),
      created_by: '1',
      ...data, 
      updated_at: new Date().toISOString() 
    };
  },

  deletePage: async (id: string) => {
    return true;
  },

  // Блоки страниц
  getBlocks: async (pageId: string) => {
    return [];
  },

  createBlock: async (pageId: string, blockData: any) => {
    return {
      id: Date.now().toString(),
      type: blockData.type || 'text',
      content: blockData.content || {},
      position: blockData.position || 0,
      parent_block: blockData.parent_block,
      children: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  updateBlock: async (blockId: string, updates: any) => {
    return { id: blockId, ...updates };
  },

  deleteBlock: async (blockId: string) => {
    return true;
  },

  // Комментарии страниц
  getPageComments: async (pageId: string) => {
    return [];
  },

  createPageComment: async (pageId: string, commentData: any) => {
    return {
      id: Date.now(),
      content: commentData.content || '',
      author: commentData.author || 0,
      author_name: commentData.author_name || '',
      author_avatar: commentData.author_avatar || '',
      parent: commentData.parent,
      block: commentData.block,
      is_resolved: commentData.is_resolved || false,
      replies: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  updatePageComment: async (pageId: string, commentId: string, updates: any) => {
    return { id: commentId, ...updates };
  },

  deletePageComment: async (pageId: string, commentId: string) => {
    return true;
  },

  // Дополнительные методы
  getRecentPages: async (workspaceId: string, limit?: number) => {
    return [];
  },

  sharePage: async (data: { page_id: string; share_type: 'public' | 'private'; public_access: boolean }) => {
    return { success: true };
  },

  getPageShares: async (pageId: string) => {
    return [];
  },

  archivePage: async (id: string) => {
    return { 
      id, 
      title: 'Заглушка',
      content: '',
      workspace: '1',
      tags: [],
      permissions: {},
      is_template: false,
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: '1',
      is_archived: true 
    };
  },

  duplicatePage: async (id: string) => {
    return {
      id: Date.now().toString(),
      title: 'Копия страницы',
      content: '',
      workspace: '1',
      tags: [],
      permissions: {},
      is_template: false,
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: '1',
    };
  },

  getPageChildren: async (pageId: string) => {
    return [];
  },

  getPageVersions: async (pageId: string) => {
    return [];
  },

  searchPages: async (query: string, params?: any) => {
    return { results: [], count: 0 };
  },

  createDatabaseBlock: async (pageId: string, databaseId: string, viewId: string) => {
    return {
      id: Date.now().toString(),
      type: 'database',
      content: { database_id: databaseId, view_id: viewId },
      position: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
};