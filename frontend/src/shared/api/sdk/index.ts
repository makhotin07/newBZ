import api from '../api';

// Типы для API ответов
export type ApiResponse<T> = {
  data: T;
  status: number;
  message?: string;
};

// Базовый класс для API клиента
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  // Универсальный метод для HTTP запросов
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    params?: any
  ): Promise<ApiResponse<T>> {
    try {
      const config: any = {
        method,
        url: `${this.baseURL}${url}`,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        config.data = data;
      }

      if (params) {
        config.params = params;
      }

      const response = await api(config);
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message);
    }
  }

  // Методы для работы с пользователями
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/auth/me/');
  }

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', '/api/auth/me/', data);
  }

  async changePassword(data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', '/api/auth/me/password/', data);
  }

  // Методы для работы с рабочими пространствами
  async getWorkspaces(): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/workspaces/');
  }

  async getWorkspace(id: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/workspaces/${id}/`);
  }

  async createWorkspace(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/workspaces/', data);
  }

  async updateWorkspace(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/workspaces/${id}/`, data);
  }

  async deleteWorkspace(id: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/workspaces/${id}/`);
  }

  async getWorkspaceMembers(workspaceId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/workspaces/${workspaceId}/members/`);
  }

  async inviteUser(workspaceId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('POST', `/api/workspaces/${workspaceId}/invite/`, data);
  }

  async updateMemberRole(workspaceId: string, memberId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/workspaces/${workspaceId}/members/${memberId}/`, data);
  }

  async removeMember(workspaceId: string, memberId: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/workspaces/${workspaceId}/members/${memberId}/`);
  }

  async getWorkspaceSettings(workspaceId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/workspaces/${workspaceId}/settings/`);
  }

  async updateWorkspaceSettings(workspaceId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/workspaces/${workspaceId}/settings/`, data);
  }

  async getWorkspaceAnalytics(workspaceId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/workspaces/${workspaceId}/analytics/`);
  }

  async getWorkspaceTaskStats(workspaceId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/workspaces/${workspaceId}/task-stats/`);
  }

  // Методы для работы с приглашениями
  async getPendingInvitations(): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/workspaces/invitations/');
  }

  async acceptInvitation(token: string): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/workspaces/invitations/accept/', { token });
  }

  async declineInvitation(token: string): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/workspaces/invitations/decline/', { token });
  }

  // Методы для работы со страницами
  async getPages(params?: any): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/notes/pages/', undefined, params);
  }

  async getPage(id: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/notes/pages/${id}/`);
  }

  async createPage(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/notes/pages/', data);
  }

  async updatePage(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/notes/pages/${id}/`, data);
  }

  async deletePage(id: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/notes/pages/${id}/`);
  }

  async getPageComments(pageId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/notes/pages/${pageId}/comments/`);
  }

  async createPageComment(pageId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('POST', `/api/notes/pages/${pageId}/comments/`, data);
  }

  async updatePageComment(pageId: string, commentId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/notes/pages/${pageId}/comments/${commentId}/`, data);
  }

  async deletePageComment(pageId: string, commentId: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/notes/pages/${pageId}/comments/${commentId}/`);
  }

  async resolvePageComment(pageId: string, commentId: string): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/notes/pages/${pageId}/comments/${commentId}/resolve/`);
  }

  // Методы для работы с тегами
  async getTags(): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/notes/tags/');
  }

  async createTag(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/notes/tags/', data);
  }

  async updateTag(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/notes/tags/${id}/`, data);
  }

  async deleteTag(id: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/notes/tags/${id}/`);
  }

  // Методы для работы с блоками
  async getPageBlocks(pageId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/notes/pages/${pageId}/blocks/`);
  }

  async createPageBlock(pageId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('POST', `/api/notes/pages/${pageId}/blocks/`, data);
  }

  async updateBlock(blockId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/notes/blocks/${blockId}/`, data);
  }

  async deleteBlock(blockId: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/notes/blocks/${blockId}/`);
  }

  // Методы для работы с задачами
  async getTaskBoards(params?: any): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/taskboards/', undefined, params);
  }

  async getTaskBoard(id: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/taskboards/${id}/`);
  }

  async createTaskBoard(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/taskboards/', data);
  }

  async updateTaskBoard(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/taskboards/${id}/`, data);
  }

  async deleteTaskBoard(id: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/taskboards/${id}/`);
  }

  async getTaskBoardColumns(boardId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/taskboards/${boardId}/columns/`);
  }

  async createTaskBoardColumn(boardId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('POST', `/api/taskboards/${boardId}/columns/`, data);
  }

  async updateTaskBoardColumn(columnId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/taskboards/columns/${columnId}/`, data);
  }

  async deleteTaskBoardColumn(columnId: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/taskboards/columns/${columnId}/`);
  }

  async getTasks(params?: any): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/tasks/', undefined, params);
  }

  async getTask(id: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/tasks/${id}/`);
  }

  async createTask(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/tasks/', data);
  }

  async updateTask(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/tasks/${id}/`, data);
  }

  async deleteTask(id: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/tasks/${id}/`);
  }

  async moveTask(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/tasks/${id}/move/`, data);
  }

  async getTaskActivity(taskId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/tasks/${taskId}/activity/`);
  }

  // Методы для работы с базами данных
  async getDatabases(workspaceId?: string): Promise<ApiResponse<any>> {
    const params = workspaceId ? { workspace: workspaceId } : undefined;
    return this.request('GET', '/api/databases/', undefined, params);
  }

  async getDatabase(id: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/databases/${id}/`);
  }

  async createDatabase(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/databases/', data);
  }

  async updateDatabase(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/databases/${id}/`, data);
  }

  async deleteDatabase(id: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/databases/${id}/`);
  }

  async getDatabaseProperties(databaseId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/databases/${databaseId}/properties/`);
  }

  async createDatabaseProperty(databaseId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('POST', `/api/databases/${databaseId}/properties/`, data);
  }

  async updateDatabaseProperty(propertyId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/databases/${propertyId}/properties/`, data);
  }

  async deleteDatabaseProperty(propertyId: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/databases/${propertyId}/properties/`);
  }

  async getDatabaseRecords(databaseId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/databases/${databaseId}/records/`);
  }

  async createDatabaseRecord(databaseId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('POST', `/api/databases/${databaseId}/records/`, data);
  }

  async updateDatabaseRecord(recordId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/databases/${recordId}/records/`, data);
  }

  async deleteDatabaseRecord(recordId: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/databases/${recordId}/records/`);
  }

  async getDatabaseViews(databaseId: string): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/databases/${databaseId}/views/`);
  }

  async createDatabaseView(databaseId: string, data: any): Promise<ApiResponse<any>> {
    return this.request('POST', `/api/databases/${databaseId}/views/`, data);
  }

  // Методы для работы с поиском
  async search(query: string, params?: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/search/search/', { query, ...params });
  }

  async getGlobalSearch(params?: any): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/search/global/', undefined, params);
  }

  async getWorkspaceSearch(workspaceId: string, params?: any): Promise<ApiResponse<any>> {
    return this.request('GET', `/api/search/workspace/${workspaceId}/`, undefined, params);
  }

  async getSearchHistory(): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/search/history/');
  }

  async addSearchHistory(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/search/history/', data);
  }

  async clearSearchHistory(): Promise<ApiResponse<any>> {
    return this.request('DELETE', '/api/search/history/clear/');
  }

  async deleteSearchHistoryItem(id: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/search/history/${id}/`);
  }

  async getSavedSearches(): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/search/saved/');
  }

  async createSavedSearch(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/search/saved/', data);
  }

  async updateSavedSearch(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/search/saved/${id}/`, data);
  }

  async deleteSavedSearch(id: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/search/saved/${id}/`);
  }

  async executeSavedSearch(id: string): Promise<ApiResponse<any>> {
    return this.request('POST', `/api/search/saved/${id}/execute/`);
  }

  // Методы для работы с уведомлениями
  async getNotifications(params?: any): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/notifications/', undefined, params);
  }

  async updateNotification(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/notifications/${id}/`, data);
  }

  async markAllNotificationsRead(): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/notifications/mark_all_read/');
  }

  async deleteNotification(id: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/notifications/${id}/`);
  }

  async createNotification(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/notifications/', data);
  }

  async getNotificationSettings(): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/notifications/settings/');
  }

  async updateNotificationSettings(data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', '/api/notifications/settings/', data);
  }

  async getReminders(params?: any): Promise<ApiResponse<any>> {
    return this.request('GET', '/api/notifications/reminders/', undefined, params);
  }

  async createReminder(data: any): Promise<ApiResponse<any>> {
    return this.request('POST', '/api/notifications/reminders/', data);
  }

  async updateReminder(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/notifications/reminders/${id}/`, data);
  }

  async deleteReminder(id: string): Promise<ApiResponse<any>> {
    return this.request('DELETE', `/api/notifications/reminders/${id}/`);
  }

  async snoozeReminder(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request('PATCH', `/api/notifications/reminders/${id}/`, data);
  }
}

// Экспортируем экземпляр API клиента
export const apiClient = new ApiClient();
