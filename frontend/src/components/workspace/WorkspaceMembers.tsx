import React, { useState } from 'react';
import {
  UserPlusIcon,
  UserMinusIcon,
  StarIcon,
  ShieldCheckIcon,
  PencilIcon,
  EyeIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { useWorkspaceMembers, useUpdateMemberRole, useRemoveMember, useInviteUser } from '../../hooks/useWorkspaces';
import { useAuth } from '../../contexts/AuthContext';
import { WorkspaceMember } from '../../services/workspacesApi';
import InviteUserModal from './InviteUserModal';
import LoadingSpinner from '../ui/LoadingSpinner';

interface WorkspaceMembersProps {
  workspaceId: string;
  currentUserRole?: string;
}

const WorkspaceMembers: React.FC<WorkspaceMembersProps> = ({ workspaceId, currentUserRole }) => {
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: members, isLoading } = useWorkspaceMembers(workspaceId);
  const updateMemberRoleMutation = useUpdateMemberRole(workspaceId);
  const removeMemberMutation = useRemoveMember(workspaceId);

  const canManageMembers = currentUserRole && ['owner', 'admin'].includes(currentUserRole);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <StarIcon className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <ShieldCheckIcon className="w-4 h-4 text-red-500" />;
      case 'editor':
        return <PencilIcon className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <EyeIcon className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'владелец';
      case 'admin':
        return 'админ';
      case 'editor':
        return 'редактор';
      case 'viewer':
        return 'наблюдатель';
      default:
        return role;
    }
  };
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRoleChange = (member: WorkspaceMember, newRole: string) => {
    if (member.role === newRole) return;
    
    if (member.role === 'owner' || newRole === 'owner') {
      console.warn('Роль владельца нельзя изменить таким образом. Обратитесь в поддержку.');
      return;
    }

    updateMemberRoleMutation.mutate({ memberId: member.id, role: newRole });
  };

  const handleRemoveMember = (member: WorkspaceMember) => {
    if (member.role === 'owner') {
      console.warn('Нельзя удалить владельца рабочего пространства.');
      return;
    }

    if (window.confirm(`Удалить ${member.user_name} из рабочего пространства?`)) {
      removeMemberMutation.mutate(member.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Участники ({members?.length || 0})
        </h2>
        
        {canManageMembers && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>Пригласить</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {members?.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {member.user_name?.charAt(0) || member.user_email?.charAt(0)}
                  </span>
                </div>
              </div>

              {/* Member Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.user_name || member.user_email}
                  </p>
                  {member.user_id === Number(user?.id) && (
                    <span className="text-xs text-gray-500">(вы)</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{member.user_email}</p>
                <p className="text-xs text-gray-400">
                  Присоединился {new Date(member.joined_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Role Badge */}
              <div className="flex items-center space-x-1">
                {getRoleIcon(member.role)}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                  {getRoleLabel(member.role)}
                </span>
              </div>

              {/* Actions Menu */}
              {canManageMembers && member.user_id !== Number(user?.id) && member.role !== 'owner' && (
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
                        {/* Change Role */}
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                          Изменить роль
                        </div>
                        {['admin', 'editor', 'viewer'].map((role) => (
                          <Menu.Item key={role}>
                            {({ active }) => (
                              <button
                                onClick={() => handleRoleChange(member, role)}
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } ${
                                  member.role === role ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                } flex items-center w-full px-4 py-2 text-sm`}
                                disabled={member.role === role}
                              >
                                {getRoleIcon(role)}
                                <span className="ml-2 capitalize">{getRoleLabel(role)}</span>
                                {member.role === role && (
                                  <span className="ml-auto text-xs">текущая</span>
                                )}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                        
                        <div className="border-t border-gray-100 my-1" />
                        
                        {/* Remove Member */}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleRemoveMember(member)}
                              className={`${
                                active ? 'bg-red-50' : ''
                              } flex items-center w-full px-4 py-2 text-sm text-red-700`}
                            >
                              <UserMinusIcon className="w-4 h-4 mr-2" />
                              Удалить участника
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}
            </div>
          </div>
        ))}
      </div>

      {members?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No members found</p>
        </div>
      )}

      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default WorkspaceMembers;
