import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  UserPlusIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useInviteUser, useSearchUsers } from '../../hooks/useWorkspaces';
import { InviteUserData } from '../../services/workspacesApi';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, workspaceId }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [searchQuery, setSearchQuery] = useState('');

  const inviteUserMutation = useInviteUser(workspaceId);
  const { data: searchResults } = useSearchUsers(searchQuery);

  const roles = [
    {
      value: 'viewer',
      name: 'Наблюдатель',
      description: 'Может просматривать и комментировать'
    },
    {
      value: 'editor',
      name: 'Редактор', 
      description: 'Может создавать и редактировать'
    },
    {
      value: 'admin',
      name: 'Админ',
      description: 'Управление пространством и участниками'
    }
  ];

  // Update email when search query changes
  useEffect(() => {
    setEmail(searchQuery);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }

    try {
      await inviteUserMutation.mutateAsync({
        email: email.trim(),
        role,
      });

      // Reset form and close modal
      setEmail('');
      setRole('viewer');
      setSearchQuery('');
      onClose();
    } catch (error) {
      console.error('Failed to invite user:', error);
    }
  };

  const handleClose = () => {
    if (!inviteUserMutation.isPending) {
      setEmail('');
      setRole('viewer');
      setSearchQuery('');
      onClose();
    }
  };

  const selectUser = (userEmail: string) => {
    setEmail(userEmail);
    setSearchQuery('');
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex items-center justify-between"
                >
                  Пригласить участника
                  <button
                    onClick={handleClose}
                    disabled={inviteUserMutation.isPending}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    {/* Email Search */}
                    <div>
                      <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                        Поиск по email
                      </label>
                      <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="search"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Введите email..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Search Results */}
                      {searchResults && searchResults.length > 0 && searchQuery && (
                        <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                          {searchResults.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => selectUser(user.email)}
                              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 text-left"
                            >
                                                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm font-medium">
                                {user.name?.charAt(0) || user.email?.charAt(0)}
                              </span>
                            </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {user.name}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Email */}
                    {email && (
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Приглашение
                        </label>
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md">
                          <UserPlusIcon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">{email}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEmail('');
                              setSearchQuery('');
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Роль
                      </label>
                      <div className="space-y-2">
                        {roles.map((roleOption) => (
                          <label
                            key={roleOption.value}
                            className={`flex items-start space-x-3 p-3 border rounded-md cursor-pointer transition-colors ${
                              role === roleOption.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              value={roleOption.value}
                              checked={role === roleOption.value}
                              onChange={(e) => setRole(e.target.value as any)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {roleOption.name}
                                </span>
                                {role === roleOption.value && (
                                  <CheckIcon className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {roleOption.description}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={inviteUserMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 disabled:opacity-50"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={!email.trim() || !isValidEmail(email) || inviteUserMutation.isPending}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {inviteUserMutation.isPending ? 'Отправка...' : 'Отправить приглашение'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default InviteUserModal;
