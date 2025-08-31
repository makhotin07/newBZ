/**
 * API для работы с заметками через SDK
 * Автогенерирован из OpenAPI схемы
 */
import { NotesService } from '../../shared/api/sdk/generated/services/NotesService';
import type { 
  PageCreate, 
  PageDetail, 
  PageList, 
  PatchedPageDetail,
  Tag,
  PatchedTag,
  Block,
  PatchedBlock,
  Comment,
  PatchedComment
} from '../../shared/api/sdk/generated';

// API для работы с заметками
export const notesApi = {
  // Теги
  getTags: async () => {
    const response = await NotesService.notesTagsList();
    return response;
  },

  createTag: async (data: { name: string; color?: string }) => {
    const response = await NotesService.notesTagsCreate(data);
    return response;
  },

  updateTag: async (id: string, updates: Partial<Tag>) => {
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

  createPage: async (data: PageCreate) => {
    const response = await NotesService.notesPagesCreate(data);
    return response;
  },

  updatePage: async (id: string, data: Partial<PageDetail>) => {
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

  createBlock: async (pageId: string, blockData: Partial<Block>) => {
    // TODO: Добавить page_id в API блоков
    const response = await NotesService.notesBlocksCreate(blockData);
    return response;
  },

  updateBlock: async (blockId: string, updates: Partial<Block>) => {
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

  createPageComment: async (pageId: string, commentData: Omit<Comment, 'id' | 'created_at'>) => {
    const response = await NotesService.notesPagesCommentsCreate(pageId, commentData);
    return response;
  },

  updatePageComment: async (pageId: string, commentId: string, updates: Partial<Comment>) => {
    const response = await NotesService.notesPagesCommentsPartialUpdate(pageId, commentId, updates);
    return response;
  },

  deletePageComment: async (pageId: string, commentId: string) => {
    await NotesService.notesPagesCommentsDestroy(pageId, commentId);
  },

  // Дополнительные методы (пока через старый API)
  getRecentPages: async (workspaceId: string) => {
    // TODO: Добавить в workspaces SDK метод getRecentNotes
    const response = await fetch(`/api/notes/workspace/${workspaceId}/recent/`);
    return response.json();
  },

  sharePage: async (data: { page_id: string; user_id: string; permissions: string }) => {
    // TODO: Добавить в notes SDK метод sharePage
    const response = await fetch(`/api/notes/pages/${data.page_id}/share/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  getPageShares: async (pageId: string) => {
    // TODO: Добавить в notes SDK метод getPageShares
    const response = await fetch(`/api/notes/pages/${pageId}/shares/`);
    return response.json();
  },

  archivePage: async (id: string) => {
    // Используем PATCH с полем archived
    const response = await NotesService.notesPagesPartialUpdate(id, { is_archived: true });
    return response;
  },

  duplicatePage: async (id: string) => {
    // Получаем страницу и создаем копию
    const originalPage = await NotesService.notesPagesRetrieve(id);
    const { id: _, created_at, updated_at, ...pageData } = originalPage;
    const response = await NotesService.notesPagesCreate({ 
      ...pageData, 
      title: `${pageData.title} (копия)`,
      workspace: pageData.workspace
    });
    return response;
  },

  getChildPages: async (pageId: string) => {
    // TODO: Добавить в notes SDK метод getChildPages
    const response = await fetch(`/api/notes/pages/${pageId}/children/`);
    return response.json();
  },

  getPageVersions: async (pageId: string) => {
    // TODO: Добавить в notes SDK метод getPageVersions
    const response = await fetch(`/api/notes/pages/${pageId}/versions/`);
    return response.json();
  },

  searchPages: async (query: string, params?: any) => {
    // TODO: Добавить в search SDK метод searchNotes
    const response = await fetch(`/api/notes/pages/search/?q=${encodeURIComponent(query)}`);
    return response.json();
  }
};
