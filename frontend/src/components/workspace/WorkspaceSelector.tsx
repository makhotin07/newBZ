import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ChevronDownIcon, 
  PlusIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { useWorkspaces, useLeaveWorkspace } from '../../hooks/useWorkspaces';
import { useAuth } from '../../contexts/AuthContext';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import LoadingSpinner from '../ui/LoadingSpinner';

const WorkspaceSelector: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: workspaces, isLoading } = useWorkspaces();
  const leaveWorkspaceMutation = useLeaveWorkspace();

  const currentWorkspace = workspaces?.find(w => w.id === workspaceId);

  const handleLeaveWorkspace = (workspace: any) => {
    if (workspace.member_role === 'owner') {
      // Сообщение вместо alert
      console.warn('Владельцы не могут покинуть своё рабочее пространство. Удалите его вместо этого.');
      return;
    }

    if (window.confirm(`Вы уверены, что хотите покинуть "${workspace.name}"?`)) {
      leaveWorkspaceMutation.mutate(workspace.id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingSpinner className="mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200">
      {/* Current Workspace */}
      {currentWorkspace && (
        <Menu as="div" className="relative">
          <Menu.Button className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: currentWorkspace.color }}
              >
                {currentWorkspace.icon || currentWorkspace.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentWorkspace.name}
                </p>
                <p className="text-xs text-gray-500">
                  {currentWorkspace.member_role}
                </p>
              </div>
            </div>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </Menu.Button>

          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute left-0 right-0 mt-2 bg-white rounded-md shadow-lg border border-gray-200 focus:outline-none z-50 max-h-64 overflow-y-auto">
              <div className="py-1">
                {/* Current workspace actions */}
                {currentWorkspace.member_role && ['owner', 'admin'].includes(currentWorkspace.member_role) && (
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to={`/workspace/${currentWorkspace.id}/settings`}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-2" />
                        Workspace Settings
                      </Link>
                    )}
                  </Menu.Item>
                )}

                {currentWorkspace.member_role !== 'owner' && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleLeaveWorkspace(currentWorkspace)}
                        className={`${
                          active ? 'bg-red-50' : ''
                        } flex items-center w-full px-4 py-2 text-sm text-red-700`}
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                        Leave Workspace
                      </button>
                    )}
                  </Menu.Item>
                )}

                <div className="border-t border-gray-100 my-1" />

                {/* Other workspaces */}
                {workspaces?.filter(w => w.id !== workspaceId).map((workspace) => (
                  <Menu.Item key={workspace.id}>
                    {({ active }) => (
                      <Link
                        to={`/workspace/${workspace.id}`}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                      >
                        <div 
                          className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-medium mr-3"
                          style={{ backgroundColor: workspace.color }}
                        >
                          {workspace.icon || workspace.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="truncate">{workspace.name}</p>
                          <p className="text-xs text-gray-500">{workspace.member_role}</p>
                        </div>
                      </Link>
                    )}
                  </Menu.Item>
                ))}

                <div className="border-t border-gray-100 my-1" />

                {/* Create new workspace */}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create Workspace
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      )}

      {/* No workspace selected */}
      {!currentWorkspace && workspaces && workspaces.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Выберите рабочее пространство</h3>
          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                to={`/workspace/${workspace.id}`}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: workspace.color }}
                >
                  {workspace.icon || workspace.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {workspace.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {workspace.members_count} участников
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full mt-3 flex items-center justify-center space-x-2 p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Создать пространство</span>
          </button>
        </div>
      )}

      {/* No workspaces at all */}
      {!currentWorkspace && workspaces && workspaces.length === 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">Пока нет рабочих пространств</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary w-full"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Создать первое пространство
          </button>
        </div>
      )}

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default WorkspaceSelector;
