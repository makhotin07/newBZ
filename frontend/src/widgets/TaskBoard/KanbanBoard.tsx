import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  PlusIcon, 
  EllipsisVerticalIcon, 
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';

import { useTaskBoard, useBoardTasks, useBoardColumns, useMoveTask, useCreateTaskColumn, useUpdateTaskColumn, useDeleteTaskColumn } from '../../shared/hooks/useTasks';
import { Task, TaskColumn } from '../../features/tasks/api';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import CreateTaskModal from './CreateTaskModal';
import LoadingSpinner from '../../shared/ui/LoadingSpinner';
import ConfirmModal from '../../shared/ui/ConfirmModal';
import { ru } from '../../shared/config/locales/ru';

interface KanbanBoardProps {
  boardId: string;
  workspaceId: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ boardId, workspaceId }) => {
  const [showTaskModal, setShowTaskModal] = useState<string | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [confirm, setConfirm] = useState<{ open: boolean; columnId?: string }>({ open: false });
  const [showAddColumn, setShowAddColumn] = useState(false);

  const { data: board, isLoading: boardLoading } = useTaskBoard(boardId);
  const { data: tasksData } = useBoardTasks(boardId);
  const { data: columnsData } = useBoardColumns(boardId);
  
  const moveTaskMutation = useMoveTask(boardId);
  const createColumnMutation = useCreateTaskColumn(boardId);
  const updateColumnMutation = useUpdateTaskColumn(boardId);
  const deleteColumnMutation = useDeleteTaskColumn(boardId);

  // Ensure data is always an array
  const tasks = Array.isArray(tasksData) ? tasksData : [];
  const columns = Array.isArray(columnsData) ? columnsData : [];
  
  // Additional safety check - ensure we have valid data
  if (!Array.isArray(tasks) || !Array.isArray(columns)) {
    console.error('Invalid data received:', { tasks: tasksData, columns: columnsData });
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500">Ошибка загрузки данных</p>
          <p className="text-sm text-gray-500">Попробуйте обновить страницу</p>
        </div>
      </div>
    );
  }

  // Group tasks by column ID for real columns, or by status for virtual columns
  const tasksByColumn = tasks.reduce((acc: Record<string, Task[]>, task: Task) => {
    // Если у задачи есть колонка, группируем по ID колонки
    if (task.column && columns.length > 0) {
      const columnId = task.column;
      if (!acc[columnId]) {
        acc[columnId] = [];
      }
      if (Array.isArray(acc[columnId])) {
        acc[columnId].push(task);
      }
    } else {
      // Иначе группируем по статусу для виртуальных колонок
      const columnId = task.status || 'unassigned';
      if (!acc[columnId]) {
        acc[columnId] = [];
      }
      if (Array.isArray(acc[columnId])) {
        acc[columnId].push(task);
      }
    }
    return acc;
  }, {} as Record<string, Task[]>);

  // Create virtual columns for task statuses if no columns exist
  const virtualColumns = columns.length > 0 ? columns : [
    { id: 'todo', title: 'To Do', color: '#6B7280', position: 0, tasks_count: 0 },
    { id: 'in_progress', title: 'In Progress', color: '#3B82F6', position: 1, tasks_count: 0 },
    { id: 'review', title: 'Review', color: '#F59E0B', position: 2, tasks_count: 0 },
    { id: 'done', title: 'Done', color: '#10B981', position: 3, tasks_count: 0 }
  ];

  // Sort columns by position
  const sortedColumns = virtualColumns.sort((a, b) => a.position - b.position);

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // No destination
    if (!destination) return;

    // Same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Move task
    moveTaskMutation.mutate({
      id: draggableId,
      data: {
        column: destination.droppableId,
        position: destination.index,
      },
    });
  };

  const handleCreateColumn = () => {
    if (!newColumnTitle.trim()) return;

    const colors = ['#6B7280', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    createColumnMutation.mutate({
      title: newColumnTitle.trim(),
      color: randomColor,
      position: columns.length,
    });

    setNewColumnTitle('');
    setShowAddColumn(false);
  };

  const handleUpdateColumn = (columnId: string, title: string) => {
    if (!title.trim()) return;

    updateColumnMutation.mutate({
      columnId,
      data: { title: title.trim() },
    });

    setEditingColumn(null);
  };

  const handleDeleteColumn = (columnId: string) => {
    setConfirm({ open: true, columnId });
  };

  if (boardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Board not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{board?.title || 'Без названия'}</h1>
            {board?.description && (
              <p className="text-gray-600 mt-1">{board.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{Array.isArray(tasks) ? tasks.length : 0} задач</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-6 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-6" style={{ minWidth: 'max-content' }}>
            {sortedColumns.map((column: TaskColumn) => (
              <div
                key={column.id}
                className="flex-shrink-0 w-80 bg-gray-50 rounded-lg"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      {editingColumn === column.id ? (
                        <input
                          type="text"
                          defaultValue={column.title}
                          autoFocus
                          className="text-sm font-semibold bg-transparent border-none outline-none"
                          onBlur={(e) => handleUpdateColumn(column.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateColumn(column.id, e.currentTarget.value);
                            } else if (e.key === 'Escape') {
                              setEditingColumn(null);
                            }
                          }}
                        />
                      ) : (
                        <h3 className="text-sm font-semibold text-gray-900">
                          {column?.title || 'Без названия'}
                        </h3>
                      )}
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {tasksByColumn[column?.id]?.length || 0}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setShowCreateTaskModal(column.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title={ru.tasks.addTask}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>

                      <Menu as="div" className="relative">
                        <Menu.Button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </Menu.Button>

                        <Transition
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 focus:outline-none z-10">
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => setEditingColumn(column.id)}
                                    className={`${
                                      active ? 'bg-gray-100' : ''
                                    } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                                  >
                                    <PencilIcon className="w-4 h-4 mr-2" />
                                    Rename column
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleDeleteColumn(column.id)}
                                    className={`${
                                      active ? 'bg-red-50' : ''
                                    } flex items-center w-full px-4 py-2 text-sm text-red-700`}
                                  >
                                    <TrashIcon className="w-4 h-4 mr-2" />
                                    Delete column
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                </div>

                {/* Column Tasks */}
                <Droppable droppableId={column.id}>
                  {(provided: any, snapshot: any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 space-y-3 min-h-[200px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {(Array.isArray(tasksByColumn[column.id]) ? tasksByColumn[column.id] : [])
                        .sort((a: Task, b: Task) => a.position - b.position)
                                                .map((task: Task, index: number) => {
                          // Additional safety check for task object
                          if (!task || typeof task !== 'object' || !task.id) {
                            console.error('Invalid task object:', task);
                            return null;
                          }
                          
                          return (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(provided: any, snapshot: any) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`${
                                    snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                                  }`}
                                >
                                  <TaskCard
                                    task={task}
                                    onClick={() => setShowTaskModal(task.id)}
                                  />
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                        .filter(Boolean) // Remove null values
                        }
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}

            {/* Add Column */}
            <div className="flex-shrink-0 w-80">
              {showAddColumn ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <input
                    type="text"
                    placeholder={ru.tasks.columnTitlePlaceholder}
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateColumn();
                      } else if (e.key === 'Escape') {
                        setShowAddColumn(false);
                        setNewColumnTitle('');
                      }
                    }}
                  />
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      onClick={handleCreateColumn}
                      disabled={!newColumnTitle.trim() || createColumnMutation.isPending}
                      className="btn-primary text-sm"
                    >
                      {ru.tasks.addColumn}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddColumn(false);
                        setNewColumnTitle('');
                      }}
                      className="btn-secondary text-sm"
                    >
                      {ru.tasks.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddColumn(true)}
                  className="w-full h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  {ru.tasks.addColumn}
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          taskId={showTaskModal}
          onClose={() => setShowTaskModal(null)}
        />
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <CreateTaskModal
          boardId={boardId}
          columnId={showCreateTaskModal}
          isOpen={!!showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(null)}
        />
      )}
      <ConfirmModal
        isOpen={confirm.open}
        title="Удалить колонку?"
        message="Все задачи будут перенесены в первую колонку."
        confirmText={ru.tasks.delete}
        cancelText={ru.tasks.cancel}
        onCancel={() => setConfirm({ open: false })}
        onConfirm={() => {
          if (confirm.columnId) deleteColumnMutation.mutate(confirm.columnId);
          setConfirm({ open: false });
        }}
      />
    </div>
  );
};

export default KanbanBoard;
