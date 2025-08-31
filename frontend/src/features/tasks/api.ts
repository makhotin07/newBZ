import api from '../../shared/api';
import { Tag } from '../../shared/types';

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
  board: string;
  column?: string;
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
  column: string;
  position: number;
}

class TasksApi {
  // Task Boards
  async getTaskBoards(params?: { workspace?: string }): Promise<TaskBoard[]> {
    try {
      const response = await api.get('/taskboards/', { params });
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

  async getTaskBoard(id: string): Promise<TaskBoard> {
    const response = await api.get(`/taskboards/${id}/`);
    return response.data;
  }

  async createTaskBoard(data: CreateTaskBoardData): Promise<TaskBoard> {
    const response = await api.post('/taskboards/', data);
    return response.data;
  }

  async updateTaskBoard(id: string, data: UpdateTaskBoardData): Promise<TaskBoard> {
    const response = await api.patch(`/taskboards/${id}/`, data);
    return response.data;
  }

  async deleteTaskBoard(id: string): Promise<void> {
    await api.delete(`/taskboards/${id}/`);
  }

  async getBoardColumns(boardId: string): Promise<TaskColumn[]> {
    try {
      const response = await api.get(`/taskboards/${boardId}/columns/`);
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching board columns:', error);
      return [];
    }
  }

  async createTaskColumn(boardId: string, data: CreateTaskColumnData): Promise<TaskColumn> {
    const response = await api.post(`/taskboards/${boardId}/columns/`, data);
    return response.data;
  }

  async updateTaskColumn(columnId: string, data: Partial<CreateTaskColumnData>): Promise<TaskColumn> {
    const response = await api.patch(`/taskboards/columns/${columnId}/`, data);
    return response.data;
  }

  async deleteTaskColumn(columnId: string): Promise<void> {
    await api.delete(`/taskboards/columns/${columnId}/`);
  }

  // Tasks
  async getBoardTasks(boardId: string, params?: {
    column?: string;
    assignee?: string;
    status?: string;
  }): Promise<Task[]> {
    try {
      const response = await api.get(`/taskboards/${boardId}/tasks/`, { params });
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

  async getTasks(params?: {
    board?: string;
    assigned_to_me?: boolean;
    status?: string;
    priority?: string;
  }): Promise<Task[]> {
    try {
      const response = await api.get('/tasks/', { params });
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
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
    const response = await api.patch(`/tasks/${id}/move/`, data);
    return response.data;
  }

  // Workspace Tasks
  async getWorkspaceTasks(workspaceId: string, limit: number = 10): Promise<Task[]> {
    try {
      const response = await api.get('/tasks/', { 
        params: { workspace: workspaceId, limit } 
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

  async getWorkspaceTaskStats(workspaceId: string): Promise<any> {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/task-stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workspace task stats:', error);
      return {
        total_tasks: 0,
        completed_tasks: 0,
        in_progress_tasks: 0,
        overdue_tasks: 0
      };
    }
  }



  // Task Activity
  async getTaskActivity(taskId: string): Promise<any[]> {
    try {
      const response = await api.get(`/tasks/${taskId}/activity/`);
      if (response.data && response.data.results) {
        return response.data.results;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching task activity:', error);
      return [];
    }
  }
}

export const tasksApi = new TasksApi();
