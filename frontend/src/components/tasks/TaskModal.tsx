import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  CalendarIcon, 
  UserIcon, 
  TagIcon, 
  ClockIcon,
  ChatBubbleLeftIcon,
  PaperClipIcon,
  ClockIcon as ActivityIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Tab } from '@headlessui/react';

import { useTask, useUpdateTask, useDeleteTask, useTaskComments, useCreateTaskComment, useTaskActivity } from '../../hooks/useTasks';
import { useTags } from '../../hooks/useNotes';
import TagSelector from '../ui/TagSelector';
import LoadingSpinner from '../ui/LoadingSpinner';
import { UpdateTaskData } from '../../services/tasksApi';
import ConfirmModal from '../ui/ConfirmModal';
import { ru } from '../../locales/ru';

interface TaskModalProps {
  taskId: string;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: task, isLoading } = useTask(taskId);
  const { data: comments = [] } = useTaskComments(taskId);
  const { data: activity = [] } = useTaskActivity(taskId);
  const { data: tags = [] } = useTags();

  const updateTaskMutation = useUpdateTask(task?.board || '');
  const deleteTaskMutation = useDeleteTask(task?.board || '');
  const createCommentMutation = useCreateTaskComment(taskId);

  const [formData, setFormData] = useState<UpdateTaskData>({});

  const selectedTags = tags.filter(tag => formData.tag_ids?.includes(tag.id));

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignee_ids: task.assignees.map(a => a.id),
        due_date: task.due_date || '',
        start_date: task.start_date || '',
        estimated_hours: task.estimated_hours,
        tag_ids: task.tags.map(t => t.id),
      });
    }
  }, [task]);

  const priorities = [
    { value: 'low', label: ru.tasks.priorities.low, color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: ru.tasks.priorities.medium, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: ru.tasks.priorities.high, color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: ru.tasks.priorities.urgent, color: 'bg-red-100 text-red-800' },
  ];

  const statuses = [
    { value: 'todo', label: ru.tasks.statuses.todo, color: 'bg-gray-100 text-gray-800' },
    { value: 'in_progress', label: ru.tasks.statuses.in_progress, color: 'bg-blue-100 text-blue-800' },
    { value: 'review', label: ru.tasks.statuses.review, color: 'bg-purple-100 text-purple-800' },
    { value: 'done', label: ru.tasks.statuses.done, color: 'bg-green-100 text-green-800' },
  ];

  const tabs = [ru.tasks.details, ru.tasks.comments, ru.tasks.activity];

  const handleSave = async () => {
    if (!task || !formData.title?.trim()) return;

    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        data: {
          ...formData,
          title: formData.title!.trim(),
          description: formData.description?.trim() || undefined,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setConfirmDelete(true);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  if (isLoading) {
    return (
      <Dialog as="div" className="relative z-50" onClose={onClose} open>
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <Transition appear show={true} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="fixed inset-0 bg-black bg-opacity-25"
        />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-16">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {task.board_title}
                    </h2>
                    <span className="text-sm text-gray-500">/ {task.column_title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-secondary text-sm"
                      >
                        {ru.tasks.editTask}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="btn-secondary text-sm"
                        >
                          {ru.tasks.cancel}
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={updateTaskMutation.isPending}
                          className="btn-primary text-sm"
                        >
                          {updateTaskMutation.isPending ? 'Сохранение...' : ru.tasks.save}
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleDelete}
                      disabled={deleteTaskMutation.isPending}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Удалить задачу"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex">
                  {/* Main Content */}
                  <div className="flex-1 p-6">
                    {/* Title */}
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full text-2xl font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none pb-2 mb-4"
                      />
                    ) : (
                      <h1 className="text-2xl font-semibold text-gray-900 mb-4">{task.title}</h1>
                    )}

                    {/* Description */}
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">{ru.tasks.description}</h3>
                      {isEditing ? (
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={4}
                          placeholder={ru.tasks.addDescription}
                        />
                      ) : (
                        <p className="text-gray-600 whitespace-pre-wrap">
                          {task.description || ru.tasks.noDescription}
                        </p>
                      )}
                    </div>

                    {/* Tabs */}
                    <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                      <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
                        {tabs.map((tab) => (
                          <Tab
                            key={tab}
                            className={({ selected }) =>
                              `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
                               ${selected
                                 ? 'bg-white text-blue-700 shadow'
                                 : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                               }`
                            }
                          >
                            {tab}
                          </Tab>
                        ))}
                      </Tab.List>

                      <Tab.Panels>
                        {/* Details Tab */}
                        <Tab.Panel>
                          <div className="space-y-6">
                            {/* Tags */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">{ru.tasks.tags}</h4>
                              {isEditing ? (
                                <TagSelector
                                  selectedTags={selectedTags}
                                  onChange={(tagIds) => setFormData(prev => ({ ...prev, tag_ids: tagIds }))}
                                />
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {task.tags.length > 0 ? (
                                    task.tags.map((tag) => (
                                      <span
                                        key={tag.id}
                                        className="px-2 py-1 text-xs rounded-full"
                                        style={{
                                          backgroundColor: tag.color + '20',
                                          color: tag.color,
                                        }}
                                      >
                                        {tag.name}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-500 text-sm">{ru.tasks.noTagsAssigned}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Tab.Panel>

                        {/* Comments Tab */}
                        <Tab.Panel>
                          <div className="space-y-4">
                            {/* Add Comment Form */}
                            <form onSubmit={handleAddComment} className="border-b border-gray-200 pb-4">
                              <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={ru.tasks.addComment}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={3}
                              />
                              <div className="flex justify-end mt-2">
                                <button
                                  type="submit"
                                  disabled={!newComment.trim() || createCommentMutation.isPending}
                                  className="btn-primary text-sm disabled:opacity-50"
                                >
                                  {createCommentMutation.isPending ? ru.tasks.addingComment : ru.tasks.addCommentBtn}
                                </button>
                              </div>
                            </form>

                            {/* Comments List */}
                            <div className="space-y-4">
                              {comments.map((comment) => (
                                <div key={comment.id} className="flex space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-blue-600 text-xs font-medium">
                                        {comment.author_name?.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-sm font-medium text-gray-900">
                                        {comment.author_name}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(comment.created_at).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                      {comment.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              {comments.length === 0 && (
                                <p className="text-gray-500 text-center py-4">{ru.tasks.noComments}</p>
                              )}
                            </div>
                          </div>
                        </Tab.Panel>

                        {/* Activity Tab */}
                        <Tab.Panel>
                          <div className="space-y-4">
                            {activity.map((item) => (
                              <div key={item.id} className="flex space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <ActivityIcon className="w-4 h-4 text-gray-600" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-sm font-medium text-gray-900">
                                      {item.user_name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(item.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                              </div>
                            ))}
                            {activity.length === 0 && (
                              <p className="text-gray-500 text-center py-4">{ru.tasks.noActivity}</p>
                            )}
                          </div>
                        </Tab.Panel>
                      </Tab.Panels>
                    </Tab.Group>
                  </div>

                  {/* Sidebar */}
                  <div className="w-80 border-l border-gray-200 bg-gray-50 p-6">
                    <div className="space-y-6">
                      {/* Status and Priority */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {ru.tasks.status}
                          </label>
                          {isEditing ? (
                            <select
                              value={formData.status}
                              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              {statuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              statuses.find(s => s.value === task.status)?.color
                            }`}>
                              {statuses.find(s => s.value === task.status)?.label}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {ru.tasks.priority}
                          </label>
                          {isEditing ? (
                            <select
                              value={formData.priority}
                              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            >
                              {priorities.map((priority) => (
                                <option key={priority.value} value={priority.value}>
                                  {priority.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              priorities.find(p => p.value === task.priority)?.color
                            }`}>
                              {priorities.find(p => p.value === task.priority)?.label}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dates */}
                      <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                            <CalendarIcon className="w-4 h-4 inline mr-1" />
                            {ru.tasks.dates}
                          </label>
                        <div className="space-y-2">
                          <div>
                            <label className="text-xs text-gray-500">{ru.tasks.startDate}</label>
                            {isEditing ? (
                              <input
                                type="date"
                                value={formData.start_date || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            ) : (
                              <p className="text-sm text-gray-600">
                                {task.start_date ? new Date(task.start_date).toLocaleDateString() : ru.tasks.notSet}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">{ru.tasks.dueDate}</label>
                            {isEditing ? (
                              <input
                                type="date"
                                value={formData.due_date || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            ) : (
                              <p className={`text-sm ${task.is_overdue ? 'text-red-600' : 'text-gray-600'}`}>
                                {task.due_date ? new Date(task.due_date).toLocaleDateString() : ru.tasks.notSet}
                                {task.is_overdue && ` (${ru.tasks.overdue})`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Estimated Hours */}
                      <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                            <ClockIcon className="w-4 h-4 inline mr-1" />
                            {ru.tasks.estimatedHours}
                          </label>
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={formData.estimated_hours || ''}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              estimated_hours: e.target.value ? parseFloat(e.target.value) : undefined 
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="0.0"
                          />
                        ) : (
                          <p className="text-sm text-gray-600">
                            {task.estimated_hours ? `${task.estimated_hours}h` : ru.tasks.notSet}
                          </p>
                        )}
                      </div>

                      {/* Assignees */}
                      <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                            <UserIcon className="w-4 h-4 inline mr-1" />
                            {ru.tasks.assignees}
                          </label>
                        <div className="space-y-2">
                          {task.assignees.length > 0 ? (
                            task.assignees.map((assignee) => (
                              <div key={assignee.id} className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 text-xs font-medium">
                                    {assignee.name?.charAt(0)}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-900">{assignee.name}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">{ru.tasks.noOneAssigned}</p>
                          )}
                        </div>
                      </div>

                      {/* Created By */}
                      <div>
                                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                            {ru.tasks.createdBy}
                          </label>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-xs font-medium">
                              {task.created_by_name?.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">{task.created_by_name}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(task.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
      <ConfirmModal
        isOpen={confirmDelete}
        title="Удалить задачу?"
        message="Действие необратимо."
        confirmText="Удалить"
        cancelText="Отмена"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          try {
            await deleteTaskMutation.mutateAsync(taskId);
            setConfirmDelete(false);
            onClose();
          } catch {}
        }}
      />
    </Transition>
  );
};

export default TaskModal;
