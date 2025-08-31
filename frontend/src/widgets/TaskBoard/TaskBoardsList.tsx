import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  ClipboardDocumentListIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';

import { useTaskBoards, useDeleteTaskBoard } from '../../shared/hooks/useTasks';
import { TaskBoard } from '../../features/tasks/api';
import CreateTaskBoardModal from './CreateTaskBoardModal';
import ConfirmModal from '../../shared/ui/ConfirmModal';
import LoadingSpinner from '../../shared/ui/LoadingSpinner';
import EmptyState from '../../shared/ui/EmptyState';
import { ru } from '../../shared/config/locales/ru';

interface TaskBoardsListProps {
  workspaceId: string;
}

const TaskBoardsList: React.FC<TaskBoardsListProps> = ({ workspaceId }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string; title?: string }>({ open: false });

  const { data: boards, isLoading } = useTaskBoards(workspaceId);
  const deleteTaskBoardMutation = useDeleteTaskBoard();

  const handleDeleteBoard = (board: TaskBoard) => {
    setConfirm({ open: true, id: board.id, title: board.title });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const sortedBoards = boards?.sort((a: any, b: any) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Доски задач</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Новая доска</span>
        </button>
      </div>

      {sortedBoards.length === 0 ? (
        <EmptyState
          icon={<ClipboardDocumentListIcon className="w-12 h-12" />}
          title="Пока нет досок задач"
          description="Создайте первую доску задач, чтобы организовать работу в формате Канбан."
          action={{
            label: 'Создать доску',
            onClick: () => setShowCreateModal(true),
            variant: 'primary'
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBoards.map((board: any) => (
            <TaskBoardCard
              key={board.id}
              board={board}
              workspaceId={workspaceId}
              onDelete={handleDeleteBoard}
            />
          ))}
        </div>
      )}

      <CreateTaskBoardModal
        workspaceId={workspaceId}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <ConfirmModal
        isOpen={confirm.open}
        title={ru.tasks.deleteBoardConfirm}
        message={`${ru.tasks.deleteBoardMessage}${confirm.title ? ` на доске "${confirm.title}"` : ''}.`}
        confirmText={ru.tasks.delete}
        cancelText={ru.tasks.cancel}
        onCancel={() => setConfirm({ open: false })}
        onConfirm={() => {
          if (confirm.id) deleteTaskBoardMutation.mutate(confirm.id);
          setConfirm({ open: false });
        }}
      />
    </div>
  );
};

interface TaskBoardCardProps {
  board: TaskBoard;
  workspaceId: string;
  onDelete: (board: TaskBoard) => void;
}

const TaskBoardCard: React.FC<TaskBoardCardProps> = ({ board, workspaceId, onDelete }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            to={`/workspace/${workspaceId}/tasks/${board.id}`}
            className="block group"
          >
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {board.title}
            </h3>
            {board.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {board.description}
              </p>
            )}
          </Link>
        </div>

        <Menu as="div" className="relative">
          <Menu.Button className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <EllipsisVerticalIcon className="w-5 h-5" />
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
                    <Link
                      to={`/workspace/${workspaceId}/tasks/${board.id}/settings`}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      {ru.tasks.editBoard}
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onDelete(board)}
                      className={`${
                        active ? 'bg-red-50' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-red-700`}
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      {ru.tasks.deleteBoard}
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <div className="space-y-3">
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <ClipboardDocumentListIcon className="w-4 h-4" />
              <span>{board.columns_count} columns</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>•</span>
              <span>{board.tasks_count} tasks</span>
            </div>
          </div>
        </div>

        {/* Created by and date */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <UserIcon className="w-3 h-3" />
            <span>Created by {board.created_by_name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarIcon className="w-3 h-3" />
            <span>{new Date(board.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action */}
        <div className="pt-2 border-t border-gray-100">
          <Link
            to={`/workspace/${workspaceId}/tasks/${board.id}`}
            className="block w-full text-center py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Open Board →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TaskBoardsList;
