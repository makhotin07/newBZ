/**
 * API для работы с заметками через SDK
 * Автогенерирован из OpenAPI схемы
 */
import { NotesService } from '../../shared/api/sdk/generated/services/NotesService';
import { BlockTypeEnum } from '../../shared/api/sdk/generated/models/BlockTypeEnum';

// API для работы с заметками
export const notesApi = {
  // Теги
  getTags: async () => {
    const response = await NotesService.notesTagsList();
    return response;
  },

  createTag: async (data: { name: string; color?: string }) => {
    // Создаем объект с обязательными полями
    const response = await NotesService.notesTagsCreate({
      id: 0,
      name: data.name,
      color: data.color || '#6B7280',
      created_at: new Date().toISOString()
    });
    return response;
  },

  updateTag: async (id: string, updates: any) => {
    const response = await NotesService.notesTagsPartialUpdate(id, updates);
    return response;
  },

  deleteTag: async (id: string) => {
    await NotesService.notesTagsDestroy(id);
  },

  // Страницы
  getPages: async (params?: any) => {
    const response = await NotesService.notesPagesList(params?.page);
    return response;
  },

  getPage: async (id: string) => {
    const response = await NotesService.notesPagesRetrieve(id);
    return response;
  },

  createPage: async (data: any) => {
    const response = await NotesService.notesPagesCreate(data);
    return response;
  },

  updatePage: async (id: string, data: any) => {
    const response = await NotesService.notesPagesPartialUpdate(id, data);
    return response;
  },

  deletePage: async (id: string) => {
    await NotesService.notesPagesDestroy(id);
  },

  // Блоки страниц
  getBlocks: async (pageId: string) => {
    const response = await NotesService.notesBlocksList();
    // TODO: Добавить фильтрацию по page_id в API
    return response;
  },

  createBlock: async (pageId: string, blockData: any) => {
    const response = await NotesService.notesBlocksCreate({
      id: '',
      type: blockData.type || 'text',
      content: blockData.content || {},
      position: blockData.position || 0,
      parent_block: blockData.parent_block,
      children: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return response;
  },

  updateBlock: async (blockId: string, updates: any) => {
    const response = await NotesService.notesBlocksPartialUpdate(blockId, updates);
    return response;
  },

  deleteBlock: async (blockId: string) => {
    await NotesService.notesBlocksDestroy(blockId);
  },

  // Комментарии страниц
  getPageComments: async (pageId: string) => {
    const response = await NotesService.notesPagesCommentsList(pageId);
    return response;
  },

  createPageComment: async (pageId: string, commentData: any) => {
    const response = await NotesService.notesPagesCommentsCreate(pageId, {
      id: 0,
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
    });
    return response;
  },

  updatePageComment: async (pageId: string, commentId: string, updates: any) => {
    const response = await NotesService.notesPagesCommentsPartialUpdate(pageId, commentId, updates);
    return response;
  },

  deletePageComment: async (pageId: string, commentId: string) => {
    await NotesService.notesPagesCommentsDestroy(pageId, commentId);
  },

  // Дополнительные методы (пока через старый API)
  getRecentPages: async (workspaceId: string) => {
    const response = await fetch(`/api/notes/workspace/${workspaceId}/recent/`);
    return response.json();
  },

  sharePage: async (data: { page_id: string; user_id: string; permissions: string }) => {
    const response = await fetch(`/api/notes/pages/${data.page_id}/share/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  getPageShares: async (pageId: string) => {
    const response = await fetch(`/api/notes/pages/${pageId}/shares/`);
    return response.json();
  },

  archivePage: async (id: string) => {
    const response = await NotesService.notesPagesPartialUpdate(id, { is_archived: true });
    return response;
  },

  duplicatePage: async (id: string) => {
    const originalPage = await NotesService.notesPagesRetrieve(id);
    const response = await NotesService.notesPagesCreate({
      title: `${originalPage.title} (копия)`,
      content: originalPage.content,
      icon: originalPage.icon,
      cover_image: originalPage.cover_image,
      workspace: parseInt(originalPage.workspace as string, 10),
      parent: originalPage.parent || null,
      tag_ids: originalPage.tags?.map((tag: any) => tag.id) || [],
      permissions: originalPage.permissions,
      is_template: originalPage.is_template,
      position: originalPage.position
    });
    return response;
  },

  getChildPages: async (pageId: string) => {
    const response = await fetch(`/api/notes/pages/${pageId}/children/`);
    return response.json();
  },

  getPageVersions: async (pageId: string) => {
    const response = await fetch(`/api/notes/pages/${pageId}/versions/`);
    return response.json();
  },

  searchPages: async (query: string, params?: any) => {
    const response = await fetch(`/api/notes/pages/search/?q=${encodeURIComponent(query)}`);
    return response.json();
  }
};
