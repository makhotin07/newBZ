import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  DocumentIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usePages, useCreatePage, useArchivePage, useDuplicatePage, useDeletePage } from '../../../../shared/hooks/useNotes';
import { Page } from '../../api';
import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';
import EmptyState from '../../../../shared/ui/EmptyState';
import { notesApi } from '../../api';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';


interface PageListProps {
  workspaceId: string;
  parentId?: string | null;
  showArchived?: boolean;
  showTemplates?: boolean;
}

const PageList: React.FC<PageListProps> = ({ 
  workspaceId, 
  parentId = null, 
  showArchived = false,
  showTemplates = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });

  const { data: pages, isLoading } = usePages({
    workspace: workspaceId,
    parent: parentId || 'null',
    archived: showArchived,
    templates: showTemplates,
  });
  
  const createPageMutation = useCreatePage();

  const archivePageMutation = useArchivePage();
  const duplicatePageMutation = useDuplicatePage();
  const deletePageMutation = useDeletePage();

  const filteredPages = pages?.filter((page: any) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const queryClient = useQueryClient();
  const reorderMutation = useMutation({
    mutationFn: async ({ id, position }: { id: string; position: number }) => {
      return notesApi.updatePage(id, { position });
    },
    onSuccess: () => {
      // Обновим списки страниц
      queryClient.invalidateQueries();
    },
  });

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    try {
      await createPageMutation.mutateAsync({
        title: newPageTitle,
        workspace: workspaceId,
        parent: parentId || undefined,
      });
      
      setNewPageTitle('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  // Функция для открытия preview в URL
  const openPreviewInUrl = (pageId: string) => {
    const params = new URLSearchParams(location.search);
    params.set('preview', pageId);
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.index === destination.index) return;

    // Текущий упорядоченный список (как на экране)
    const ordered = filteredPages.slice();

    // Элемент, который перемещаем
    const moved = ordered[source.index];
    if (!moved) return;

    // Считаем новую позицию через соседние элементы
    const newIndex = destination.index;
    const prevItem = ordered[newIndex - 1] && ordered[newIndex - 1].id !== moved.id
      ? ordered[newIndex - 1]
      : undefined;
    const nextItem = ordered[newIndex] && ordered[newIndex].id !== moved.id
      ? ordered[newIndex]
      : ordered[newIndex + 1];

    let newPosition: number;
    if (!prevItem && nextItem) {
      // В начало списка
      newPosition = (nextItem.position ?? 0) - 1;
    } else if (prevItem && !nextItem) {
      // В конец списка
      newPosition = (prevItem.position ?? 0) + 1;
    } else if (prevItem && nextItem) {
      // Между
      const prevPos = prevItem.position ?? 0;
      const nextPos = nextItem.position ?? prevPos + 1;
      newPosition = (prevPos + nextPos) / 2;
    } else {
      // Единственный элемент
      newPosition = moved.position ?? 0;
    }

    reorderMutation.mutate({ id: moved.id, position: newPosition });
  };

  const handlePageClick = (page: Page) => {
    openPreviewInUrl(page.id);
  };



  // const handleEditPage = (pageId: string) => {
  //   // Здесь можно добавить логику для перехода к редактированию
  //   console.log('Редактировать страницу:', pageId);
  // };

  // const handleDeletePage = (pageId: string) => {
  //   setConfirm({ open: true, id: pageId });
  // };

  const PageItem: React.FC<{ 
    page: Page; 
    index: number;
    workspaceId: string;
  }> = ({ page, index, workspaceId }) => {
    const [expanded, setExpanded] = useState(false);
    return (
      <>
      <Draggable draggableId={page.id} index={index}>
        {(provided: any, snapshot: any) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`group flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200 ${
              snapshot.isDragging ? 'shadow-lg bg-white' : ''
            }`}
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              {page.icon ? (
                <span className="text-lg hover:scale-110 transition-transform">{page.icon}</span>
              ) : (
                <DocumentIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              )}
            </div>

            {/* Content */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => handlePageClick(page)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {page.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <span>Updated {new Date(page.updated_at).toLocaleDateString()}</span>
                    {page.children && page.children.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{page.children.length} subpages</span>
                      </>
                    )}
                    {page.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex space-x-1">
                          {page.tags.slice(0, 2).map((tag: any) => (
                            <span
                              key={tag.id}
                              className="px-1.5 py-0.5 rounded text-xs hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: tag.color + '20', color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                                                  {page.tags.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                            +{page.tags.length - 2}
                          </span>
                        )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Expand children toggle */}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setExpanded(v => !v); }}
                  className="ml-3 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                >
                  {expanded ? 'Свернуть' : 'Показать дочерние'}
                </button>

                {/* Edit button */}
                <Link
                  to={`/workspace/${workspaceId}/page/${page.id}`}
                  className="ml-2 p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PencilIcon className="w-4 h-4" />
                </Link>

                {/* Actions Menu */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Menu as="div" className="relative">
                    <Menu.Button
                      type="button"
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
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
                      <Menu.Items onClick={(e)=> e.stopPropagation()} className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 focus:outline-none z-10">
                        <div className="py-1">
                          {/* Create Subpage */}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  createPageMutation.mutate({
                                    title: 'Новая страница',
                                    workspace: workspaceId,
                                    parent: page.id,
                                  });
                                }}
                                className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors`}
                              >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Создать подстраницу
                              </button>
                            )}
                          </Menu.Item>
                          <div className="border-t border-gray-100 my-1" />
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  duplicatePageMutation.mutate(page.id);
                                }}
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors`}
                              >
                                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                                Duplicate
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  archivePageMutation.mutate(page.id);
                                }}
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors`}
                              >
                                <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                                {page.is_archived ? 'Unarchive' : 'Archive'}
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setConfirm({ open: true, id: page.id });
                                }}
                                className={`${
                                  active ? 'bg-red-50' : ''
                                } flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-100 transition-colors`}
                              >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Удалить
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
          </div>
        )}
      </Draggable>
      {expanded && (
        <div className="ml-8 mt-1 hover:ml-10 transition-all duration-200">
          <ChildPages parentId={page.id} workspaceId={workspaceId} />
        </div>
      )}
      </>
    );
  };

  const ChildPages: React.FC<{ parentId: string; workspaceId: string }> = ({ parentId, workspaceId }) => {
    const { data: children, isLoading } = usePages({ workspace: workspaceId, parent: parentId });
    const createPageMutation = useCreatePage();
    if (isLoading) return null;
    if (!children || children.length === 0) return (
      <div className="pl-6 py-2 text-xs text-gray-500 hover:text-gray-600 transition-colors">Нет дочерних страниц</div>
    );
    const ChildRow: React.FC<{ node: Page }> = ({ node }) => {
      const [open, setOpen] = useState(false);
      return (
        <div className="pl-4 hover:pl-6 transition-all duration-200">
          <div className="flex items-center space-x-2">
            <DocumentIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
            <Link to={`/workspace/${workspaceId}/page/${node.id}`} className="text-sm text-gray-700 hover:text-blue-600 truncate flex-1 transition-colors">
              {node.title}
            </Link>
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
              onClick={() => setOpen(v => !v)}
            >
              {open ? 'Свернуть' : 'Дочерние'}
            </button>
            <button
              type="button"
              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
              onClick={() => createPageMutation.mutate({ title: 'Новая страница', workspace: workspaceId, parent: node.id })}
            >
              + Подстраница
            </button>
          </div>
          {open && (
            <ChildPages parentId={node.id} workspaceId={workspaceId} />
          )}
        </div>
      );
    };

    return (
      <div className="space-y-1 hover:space-y-2 transition-all duration-200">
        {children.map((child: any) => (
          <ChildRow key={child.id} node={child} />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4 hover:space-y-5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors">
          {showArchived ? 'Архивированные страницы' : showTemplates ? 'Шаблоны' : 'Страницы'}
        </h2>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2 hover:shadow-md transition-shadow"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Новая страница</span>
        </button>
      </div>

      {/* Search */}
              <div className="relative group">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        <input
          type="text"
          placeholder="Поиск страниц..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
        />
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreatePage} className="bg-gray-50 p-4 rounded-lg border hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Заголовок страницы..."
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newPageTitle.trim() || createPageMutation.isPending}
              className="btn-primary hover:shadow-md transition-shadow"
            >
              Создать
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewPageTitle('');
              }}
              className="btn-secondary hover:shadow-sm transition-shadow"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {/* Pages List */}
      {filteredPages.length === 0 ? (
        <EmptyState
          icon={<DocumentIcon className="w-12 h-12" />}
          title={showArchived ? 'Нет архивных страниц' : 'Пока нет страниц'}
          description={
            showArchived
              ? 'Архивные страницы появятся здесь'
              : 'Начните с создания первой страницы'
          }
          action={
            !showArchived ? {
              label: 'Создать страницу',
              onClick: () => setShowCreateForm(true),
              variant: 'primary'
            } : undefined
          }
        />
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="pages-list">
            {(provided: any) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2 hover:space-y-3 transition-all duration-200"
              >
                {filteredPages.map((page: any, index: any) => (
                  <PageItem
                    key={page.id}
                    page={page}
                    index={index}
                    workspaceId={workspaceId}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
      <ConfirmModal
        isOpen={confirm.open}
        title="Удалить страницу?"
        message="Действие необратимо."
        confirmText="Удалить"
        cancelText="Отмена"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={() => {
          if (confirm.id) deletePageMutation.mutate(confirm.id);
          setConfirm({ open: false });
        }}
      />


    </div>
  );
};

export default PageList;
