import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  TableCellsIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';

import { useDatabases, useDeleteDatabase } from '../../shared/hooks/useDatabases';
import type { Database } from '../../features/databases/types/database';
import CreateDatabaseModal from './CreateDatabaseModal';
import ConfirmModal from '../../shared/ui/ConfirmModal';
import LoadingSpinner from '../../shared/ui/LoadingSpinner';
import EmptyState from '../../shared/ui/EmptyState';

interface DatabasesListProps {
  workspaceId: string;
}

const DatabasesList: React.FC<DatabasesListProps> = ({ workspaceId }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string; title?: string }>({ open: false });

  const { data: databases, isLoading } = useDatabases(workspaceId);
  const deleteDatabaseMutation = useDeleteDatabase();

  const handleDeleteDatabase = (database: Database) => {
    setConfirm({ open: true, id: database.id, title: database.title });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const sortedDatabases = databases?.sort((a: Database, b: Database) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Базы данных</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Новая база</span>
        </button>
      </div>

      {sortedDatabases.length === 0 ? (
        <EmptyState
          icon={<TableCellsIcon className="w-12 h-12" />}
          title="Пока нет баз данных"
          description="Создайте первую базу данных, чтобы организовать данные с помощью свойств и представлений."
          action={{
            label: 'Создать базу',
            onClick: () => setShowCreateModal(true),
            variant: 'primary'
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDatabases.map((database: Database) => (
            <DatabaseCard
              key={database.id}
              database={database}
              workspaceId={workspaceId}
              onDelete={handleDeleteDatabase}
            />
          ))}
        </div>
      )}

      <CreateDatabaseModal
        workspaceId={workspaceId}
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <ConfirmModal
        isOpen={confirm.open}
        title="Удалить базу данных?"
        message={`Будут удалены также все записи${confirm.title ? `: "${confirm.title}"` : ''}.`}
        confirmText="Удалить"
        cancelText="Отмена"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={() => {
          if (confirm.id) deleteDatabaseMutation.mutate(confirm.id);
          setConfirm({ open: false });
        }}
      />
    </div>
  );
};

interface DatabaseCardProps {
  database: Database;
  workspaceId: string;
  onDelete: (database: Database) => void;
}

const DatabaseCard: React.FC<DatabaseCardProps> = ({ database, workspaceId, onDelete }) => {
  const getViewIcon = (viewType: string) => {
    switch (viewType) {
      case 'table':
        return <TableCellsIcon className="w-4 h-4" />;
      case 'gallery':
        return <ViewColumnsIcon className="w-4 h-4" />;
      case 'list':
        return <DocumentTextIcon className="w-4 h-4" />;
      case 'board':
        return <ViewColumnsIcon className="w-4 h-4" />;
      case 'calendar':
        return <CalendarIcon className="w-4 h-4" />;
      default:
        return <TableCellsIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            to={`/workspace/${workspaceId}/database/${database.id}`}
            className="block group"
          >
            <div className="flex items-center space-x-3 mb-2">
              {database.icon ? (
                <span className="text-2xl">{database.icon}</span>
              ) : (
                <TableCellsIcon className="w-8 h-8 text-gray-400" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {database.title}
              </h3>
            </div>
            {database.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {database.description}
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
                      to={`/workspace/${workspaceId}/database/${database.id}/settings`}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Редактировать базу
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onDelete(database)}
                      className={`${
                        active ? 'bg-red-50' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-red-700`}
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Удалить базу
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <div className="space-y-3">
        {/* Default View */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            {getViewIcon(database.default_view)}
            <span>Представление по умолчанию: {database.default_view}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <ViewColumnsIcon className="w-4 h-4" />
              <span>{database.properties_count} свойств</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>•</span>
              <span>{database.records_count} записей</span>
            </div>
          </div>
        </div>

        {/* Created by and date */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <UserIcon className="w-3 h-3" />
            <span>Создал {database.created_by_name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <CalendarIcon className="w-3 h-3" />
            <span>{new Date(database.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action */}
        <div className="pt-2 border-t border-gray-100">
          <Link
            to={`/workspace/${workspaceId}/database/${database.id}`}
            className="block w-full text-center py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Открыть базу →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DatabasesList;
