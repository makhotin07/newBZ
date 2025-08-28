import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, TaskBoard, Task, TaskColumn, CreateTaskBoardData, UpdateTaskBoardData, CreateTaskData, UpdateTaskData, CreateTaskColumnData, MoveTaskData } from '../services/tasksApi';
import toast from 'react-hot-toast';

// Query Keys
export const taskKeys = {
  all: ['tasks'] as const,
  boards: () => [...taskKeys.all, 'boards'] as const,
  board: (id: string) => [...taskKeys.boards(), id] as const,
  boardTasks: (id: string) => [...taskKeys.board(id), 'tasks'] as const,
  boardColumns: (id: string) => [...taskKeys.board(id), 'columns'] as const,
  tasks: () => [...taskKeys.all, 'list'] as const,
  task: (id: string) => [...taskKeys.tasks(), id] as const,
  taskComments: (id: string) => [...taskKeys.task(id), 'comments'] as const,
  taskActivity: (id: string) => [...taskKeys.task(id), 'activity'] as const,
  workspaceBoards: (workspaceId: string) => [...taskKeys.boards(), workspaceId] as const,
  workspace: (workspaceId: string) => [...taskKeys.all, 'workspace', workspaceId] as const,
};

// Task Boards Hooks
export const useTaskBoards = (workspaceId?: string) => {
  return useQuery({
    queryKey: workspaceId ? taskKeys.workspaceBoards(workspaceId) : taskKeys.boards(),
    queryFn: () => tasksApi.getTaskBoards(workspaceId ? { workspace: workspaceId } : undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useWorkspaceTasks = (workspaceId: string, limit: number = 10) => {
  return useQuery({
    queryKey: [...taskKeys.workspace(workspaceId), 'recent', limit],
    queryFn: () => tasksApi.getWorkspaceTasks(workspaceId, limit),
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useWorkspaceTaskStats = (workspaceId: string) => {
  return useQuery({
    queryKey: [...taskKeys.workspace(workspaceId), 'stats'],
    queryFn: () => tasksApi.getWorkspaceTaskStats(workspaceId),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTaskBoard = (id: string) => {
  return useQuery({
    queryKey: taskKeys.board(id),
    queryFn: () => tasksApi.getTaskBoard(id),
    enabled: !!id,
  });
};

export const useCreateTaskBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskBoardData) => tasksApi.createTaskBoard(data),
    onSuccess: (newBoard) => {
      // Invalidate boards list
      queryClient.invalidateQueries({ queryKey: taskKeys.boards() });
      queryClient.invalidateQueries({ 
        queryKey: taskKeys.workspaceBoards(newBoard.workspace) 
      });
      
      toast.success('Task board created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create task board');
    },
  });
};

export const useUpdateTaskBoard = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTaskBoardData) => tasksApi.updateTaskBoard(id, data),
    onSuccess: (updatedBoard) => {
      // Update the specific board
      queryClient.setQueryData(taskKeys.board(id), updatedBoard);
      
      // Invalidate boards list
      queryClient.invalidateQueries({ queryKey: taskKeys.boards() });
      
      toast.success('Task board updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update task board');
    },
  });
};

export const useDeleteTaskBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTaskBoard(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: taskKeys.board(deletedId) });
      
      // Invalidate boards list
      queryClient.invalidateQueries({ queryKey: taskKeys.boards() });
      
      toast.success('Task board deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete task board');
    },
  });
};

// Board Tasks Hook
export const useBoardTasks = (boardId: string, params?: {
  column?: string;
  assignee?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: [...taskKeys.boardTasks(boardId), params],
    queryFn: () => tasksApi.getBoardTasks(boardId, params),
    enabled: !!boardId,
  });
};

// Board Columns Hook
export const useBoardColumns = (boardId: string) => {
  return useQuery({
    queryKey: taskKeys.boardColumns(boardId),
    queryFn: () => tasksApi.getBoardColumns(boardId),
    enabled: !!boardId,
  });
};

export const useCreateTaskColumn = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskColumnData) => tasksApi.createTaskColumn(boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.boardColumns(boardId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.board(boardId) });
      toast.success('Column created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create column');
    },
  });
};

export const useUpdateTaskColumn = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, data }: { columnId: string; data: Partial<CreateTaskColumnData> }) =>
      tasksApi.updateTaskColumn(columnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.boardColumns(boardId) });
      toast.success('Column updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update column');
    },
  });
};

export const useDeleteTaskColumn = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columnId: string) => tasksApi.deleteTaskColumn(columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.boardColumns(boardId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.boardTasks(boardId) });
      toast.success('Column deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete column');
    },
  });
};

// Tasks Hooks
export const useTasks = (params?: {
  board?: string;
  assigned_to_me?: boolean;
  status?: string;
  priority?: string;
  overdue?: boolean;
}) => {
  return useQuery({
    queryKey: [...taskKeys.tasks(), params],
    queryFn: () => tasksApi.getTasks(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: taskKeys.task(id),
    queryFn: () => tasksApi.getTask(id),
    enabled: !!id,
  });
};

export const useCreateTask = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskData) => tasksApi.createTask(data),
    onSuccess: () => {
      // Invalidate board tasks
      queryClient.invalidateQueries({ queryKey: taskKeys.boardTasks(boardId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.board(boardId) });
      
      toast.success('Task created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create task');
    },
  });
};

export const useUpdateTask = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      tasksApi.updateTask(id, data),
    onSuccess: (updatedTask) => {
      // Update the specific task
      queryClient.setQueryData(taskKeys.task(updatedTask.id), updatedTask);
      
      // Invalidate board tasks
      queryClient.invalidateQueries({ queryKey: taskKeys.boardTasks(boardId) });
      
      toast.success('Task updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update task');
    },
  });
};

export const useDeleteTask = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: taskKeys.task(deletedId) });
      
      // Invalidate board tasks
      queryClient.invalidateQueries({ queryKey: taskKeys.boardTasks(boardId) });
      
      toast.success('Task deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete task');
    },
  });
};

export const useMoveTask = (boardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MoveTaskData }) =>
      tasksApi.moveTask(id, data),
    onSuccess: () => {
      // Invalidate board tasks to refresh positions
      queryClient.invalidateQueries({ queryKey: taskKeys.boardTasks(boardId) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to move task');
    },
  });
};

// Task Comments Hooks
export const useTaskComments = (taskId: string) => {
  return useQuery({
    queryKey: taskKeys.taskComments(taskId),
    queryFn: () => tasksApi.getTaskComments(taskId),
    enabled: !!taskId,
  });
};

export const useCreateTaskComment = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => tasksApi.createTaskComment(taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.taskComments(taskId) });
      toast.success('Comment added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add comment');
    },
  });
};

// Task Activity Hook
export const useTaskActivity = (taskId: string) => {
  return useQuery({
    queryKey: taskKeys.taskActivity(taskId),
    queryFn: () => tasksApi.getTaskActivity(taskId),
    enabled: !!taskId,
  });
};
