import api from './api';
import { Tag } from './notesApi';

export interface TaskColumn {
  id: string;
  title: string;
  color: string;
  position: number;
  tasks_count: number;
}

export interface TaskBoard {
  id: string;
  title: string;
  description: string;
  workspace: string;
  workspace_name: string;
  created_by: string;
  created_by_name: string;
  columns_count: number;
  tasks_count: number;
  columns?: TaskColumn[];
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: string;
  file: string;
  original_name: string;
  uploaded_by: string;
  uploaded_by_name: string;
  file_size: number;
  uploaded_at: string;
}

export interface TaskActivity {
  id: string;
  activity_type: 'created' | 'updated' | 'assigned' | 'unassigned' | 'moved' | 'completed' | 'reopened' | 'commented';
  description: string;
  user: string;
  user_name: string;
  user_avatar?: string;
  metadata: any;
  created_at: string;
}

export interface TaskComment {
  id: string;
  content: string;
  author: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  board: string;
  board_title: string;
  column: string;
  column_title: string;
  position: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assignees: Array<{
    id: number;
    name: string;
    email: string;
    avatar?: string;
  }>;
  assignee_ids?: number[];
  created_by: string;
  created_by_name: string;
  due_date?: string;
  start_date?: string;
  completed_at?: string;
  estimated_hours?: number;
  tags: Tag[];
  tag_ids?: string[];
  comments_count: number;
  attachments_count: number;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskBoardData {
  title: string;
  description?: string;
  workspace: string;
}

export interface UpdateTaskBoardData {
  title?: string;
  description?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  board_id: string;
  column: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee_ids?: number[];
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  tag_ids?: string[];
  position?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  column?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in_progress' | 'review' | 'done';
  assignee_ids?: number[];
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  tag_ids?: string[];
  position?: number;
}

export interface CreateTaskColumnData {
  title: string;
  color?: string;
  position?: number;
}

export interface MoveTaskData {
  column_id: string;
  position: number;
}

class TasksApi {
  // Task Boards
  async getTaskBoards(params?: { workspace?: string }): Promise<TaskBoard[]> {
    try {
      const response = await api.get('/tasks/taskboards/', { params });
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching task boards:', error);
      return [];
    }
  }

  // Workspace tasks
  async getWorkspaceTasks(workspaceId: string, limit: number = 10): Promise<Task[]> {
    try {
      const response = await api.get('/tasks/tasks/', {
        params: { 
          workspace: workspaceId, 
          ordering: '-due_date',
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
      console.error('Error fetching workspace tasks:', error);
      return [];
    }
  }

  async getWorkspaceTaskStats(workspaceId: string): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  }> {
    const response = await api.get(`/tasks/workspace/${workspaceId}/stats/`);
    return response.data;
  }

  async getTaskBoard(id: string): Promise<TaskBoard> {
    const response = await api.get(`/tasks/taskboards/${id}/`);
    return response.data;
  }

  async createTaskBoard(data: CreateTaskBoardData): Promise<TaskBoard> {
    const response = await api.post('/tasks/taskboards/', data);
    return response.data;
  }

  async updateTaskBoard(id: string, data: UpdateTaskBoardData): Promise<TaskBoard> {
    const response = await api.patch(`/tasks/taskboards/${id}/`, data);
    return response.data;
  }

  async deleteTaskBoard(id: string): Promise<void> {
    await api.delete(`/tasks/taskboards/${id}/`);
  }

  async getBoardTasks(boardId: string, params?: {
    column?: string;
    assignee?: string;
    status?: string;
  }): Promise<Task[]> {
    try {
      const response = await api.get(`/tasks/taskboards/${boardId}/tasks/`, { params });
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching board tasks:', error);
      return [];
    }
  }

  // Tasks
  async getTasks(params?: {
    board?: string;
    assigned_to_me?: boolean;
    status?: string;
    priority?: string;
    overdue?: boolean;
  }): Promise<Task[]> {
    const response = await api.get('/tasks/', { params });
    return response.data.results || response.data;
  }

  async getTask(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}/`);
    return response.data;
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await api.post('/tasks/', data);
    return response.data;
  }

  async updateTask(id: string, data: UpdateTaskData): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/`, data);
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}/`);
  }

  async moveTask(id: string, data: MoveTaskData): Promise<Task> {
    const response = await api.post(`/tasks/${id}/move/`, data);
    return response.data;
  }

  // Task Columns
  async getBoardColumns(boardId: string): Promise<TaskColumn[]> {
    const response = await api.get(`/tasks/taskboards/${boardId}/columns/`);
    return response.data?.results || response.data || [];
  }

  async createTaskColumn(boardId: string, data: CreateTaskColumnData): Promise<TaskColumn> {
    const response = await api.post(`/tasks/boards/${boardId}/columns/`, data);
    return response.data;
  }

  async updateTaskColumn(columnId: string, data: Partial<CreateTaskColumnData>): Promise<TaskColumn> {
    const response = await api.patch(`/tasks/columns/${columnId}/`, data);
    return response.data;
  }

  async deleteTaskColumn(columnId: string): Promise<void> {
    await api.delete(`/tasks/columns/${columnId}/`);
  }

  // Task Comments
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    const response = await api.get(`/tasks/${taskId}/comments/`);
    return response.data.results || response.data;
  }

  async createTaskComment(taskId: string, content: string): Promise<TaskComment> {
    const response = await api.post(`/tasks/${taskId}/comments/`, { content });
    return response.data;
  }

  async updateTaskComment(commentId: string, content: string): Promise<TaskComment> {
    const response = await api.patch(`/tasks/comments/${commentId}/`, { content });
    return response.data;
  }

  async deleteTaskComment(commentId: string): Promise<void> {
    await api.delete(`/tasks/comments/${commentId}/`);
  }

  // Task Activity
  async getTaskActivity(taskId: string): Promise<TaskActivity[]> {
    const response = await api.get(`/tasks/${taskId}/activities/`);
    return response.data.results || response.data;
  }

  // Task Attachments
  async uploadTaskAttachment(taskId: string, file: File): Promise<TaskAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/tasks/${taskId}/attachments/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async deleteTaskAttachment(attachmentId: string): Promise<void> {
    await api.delete(`/tasks/attachments/${attachmentId}/`);
  }
}

export const tasksApi = new TasksApi();
