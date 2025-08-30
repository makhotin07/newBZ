import React, { useState } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { 
  XMarkIcon, 
  LinkIcon, 
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useSharePage, useGetPageShares } from '../../../../shared/hooks/useNotes';
import toast from 'react-hot-toast';

interface SharePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  pageTitle: string;
}

const SharePageModal: React.FC<SharePageModalProps> = ({
  isOpen,
  onClose,
  pageId,
  pageTitle
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [shareType, setShareType] = useState<'public' | 'private'>('private');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor'>('viewer');
  const [copied, setCopied] = useState(false);

  const sharePageMutation = useSharePage(pageId);
  const { data: shares } = useGetPageShares(pageId);

  const handleSharePage = async () => {
    try {
      await sharePageMutation.mutateAsync({
        page_id: pageId,
        share_type: shareType,
        public_access: shareType === 'public'
      });
      
      toast.success('Настройки доступа обновлены!');
      setCopied(false);
    } catch (error: any) {
      toast.error('Ошибка при обновлении настроек доступа');
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    try {
      // Здесь должен быть API для приглашения пользователей
      toast.success(`Приглашение отправлено на ${inviteEmail}`);
      setInviteEmail('');
    } catch (error: any) {
      toast.error('Ошибка при отправке приглашения');
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/shared/${pageId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Ссылка скопирована!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      // Здесь должен быть API для удаления доступа
      toast.success('Доступ удален');
    } catch (error: any) {
      toast.error('Ошибка при удалении доступа');
    }
  };

  const tabs = [
    { name: 'Поделиться', icon: LinkIcon },
    { name: 'Пригласить', icon: UserPlusIcon },
    { name: 'Управление доступом', icon: EyeIcon }
  ];

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Поделиться страницей
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Страница:</p>
                    <p className="font-medium text-gray-900">{pageTitle}</p>
                  </div>

                  <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                    <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
                      {tabs.map((tab, idx) => (
                        <Tab
                          key={tab.name}
                          className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center space-x-2
                            ${selected
                              ? 'bg-white text-blue-600 shadow'
                              : 'text-gray-600 hover:text-gray-800 hover:bg-white/[0.12]'
                            }`
                          }
                        >
                          <tab.icon className="w-4 h-4" />
                          <span>{tab.name}</span>
                        </Tab>
                      ))}
                    </Tab.List>

                    <Tab.Panels>
                      {/* Поделиться */}
                      <Tab.Panel className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Тип доступа
                          </label>
                          <div className="space-y-3">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                value="private"
                                checked={shareType === 'private'}
                                onChange={(e) => setShareType(e.target.value as 'public' | 'private')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <div className="ml-3">
                                <span className="block text-sm font-medium text-gray-900">Приватная</span>
                                <span className="block text-sm text-gray-500">Только для участников рабочего пространства</span>
                              </div>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                value="public"
                                checked={shareType === 'public'}
                                onChange={(e) => setShareType(e.target.value as 'public' | 'private')}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <div className="ml-3">
                                <span className="block text-sm font-medium text-gray-900">Публичная</span>
                                <span className="block text-sm text-gray-500">Доступна по ссылке всем</span>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={handleSharePage}
                            disabled={sharePageMutation.isPending}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {sharePageMutation.isPending ? 'Обновление...' : 'Обновить настройки'}
                          </button>
                          <button
                            onClick={handleCopyLink}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {copied ? (
                              <CheckIcon className="w-4 h-4 text-green-600" />
                            ) : (
                              <ClipboardDocumentIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {shareType === 'public' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-700">
                              Страница доступна по ссылке: <code className="bg-blue-100 px-2 py-1 rounded">{window.location.origin}/shared/{pageId}</code>
                            </p>
                          </div>
                        )}
                      </Tab.Panel>

                      {/* Пригласить */}
                      <Tab.Panel className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email пользователя
                          </label>
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="user@example.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Роль
                          </label>
                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as 'viewer' | 'editor')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="viewer">Просмотр</option>
                            <option value="editor">Редактирование</option>
                          </select>
                        </div>

                        <button
                          onClick={handleInviteUser}
                          disabled={!inviteEmail.trim()}
                          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          Отправить приглашение
                        </button>
                      </Tab.Panel>

                      {/* Управление доступом */}
                      <Tab.Panel className="space-y-4">
                        {shares && shares.length > 0 ? (
                          <div className="space-y-3">
                            {shares.map((share: any) => (
                              <div key={share.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{share.user_name || share.user_email}</p>
                                  <p className="text-xs text-gray-500 capitalize">{share.role}</p>
                                </div>
                                <button
                                  onClick={() => handleRemoveShare(share.id)}
                                  className="text-sm text-red-600 hover:text-red-800"
                                >
                                  Удалить
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <EyeSlashIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-sm">Пока нет пользователей с доступом</p>
                          </div>
                        )}
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SharePageModal;
