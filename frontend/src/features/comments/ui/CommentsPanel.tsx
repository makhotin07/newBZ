import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  CheckIcon, 
  XMarkIcon,
  EllipsisHorizontalIcon,
  ReplyIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { usePageComments, useCreateComment, useUpdateComment, useDeleteComment, useResolveComment } from '../api';
import { Comment } from '../api/types';

interface CommentsPanelProps {
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'open' | 'my' | 'resolved';

const CommentsPanel: React.FC<CommentsPanelProps> = ({ pageId, isOpen, onClose }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: commentsData, isLoading, error } = usePageComments(pageId);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const resolveCommentMutation = useResolveComment();

  const comments = commentsData?.data || [];

  // Фильтрация комментариев
  const filteredComments = comments.filter(comment => {
    if (filter === 'open') return !comment.is_resolved;
    if (filter === 'my') return comment.author === 1; // TODO: заменить на реальный ID пользователя из контекста
    if (filter === 'resolved') return comment.is_resolved;
    return true;
  });

  // Автофокус на input при открытии
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        pageId,
        data: { content: newComment }
      });
      setNewComment('');
    } catch (error) {
      console.error('Ошибка при создании комментария:', error);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        pageId,
        data: { 
          content: replyContent,
          parent: parentId
        }
      });
      setReplyContent('');
      setReplyTo(null);
    } catch (error) {
      console.error('Ошибка при создании ответа:', error);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await updateCommentMutation.mutateAsync({
        pageId,
        commentId,
        data: { content: editContent }
      });
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Ошибка при обновлении комментария:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) return;

    try {
      await deleteCommentMutation.mutateAsync({
        pageId,
        commentId
      });
    } catch (error) {
      console.error('Ошибка при удалении комментария:', error);
    }
  };

  const handleResolveComment = async (commentId: string, resolved: boolean) => {
    try {
      await resolveCommentMutation.mutateAsync({
        pageId,
        commentId,
        data: { resolved }
      });
    } catch (error) {
      console.error('Ошибка при изменении статуса комментария:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">
            Комментарии ({filteredComments.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-200 transition-colors"
          aria-label="Закрыть панель комментариев"
        >
          <XMarkIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-1">
          {[
            { key: 'all', label: 'Все' },
            { key: 'open', label: 'Открытые' },
            { key: 'my', label: 'Мои' },
            { key: 'resolved', label: 'Решённые' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as FilterType)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === key
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500">Загрузка комментариев...</div>
        ) : error ? (
          <div className="text-center text-red-500">Ошибка загрузки комментариев</div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center text-gray-500">
            {filter === 'all' ? 'Нет комментариев' : 'Нет комментариев по выбранному фильтру'}
          </div>
        ) : (
          filteredComments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={() => setReplyTo(comment.id.toString())}
              onEdit={() => {
                setEditingComment(comment.id.toString());
                setEditContent(comment.content);
              }}
              onDelete={() => handleDeleteComment(comment.id.toString())}
              onResolve={(resolved) => handleResolveComment(comment.id.toString(), resolved)}
              isEditing={editingComment === comment.id.toString()}
              editContent={editContent}
              onEditContentChange={setEditContent}
              onSaveEdit={() => handleUpdateComment(comment.id.toString())}
              onCancelEdit={() => {
                setEditingComment(null);
                setEditContent('');
              }}
              showReplyForm={replyTo === comment.id.toString()}
              replyContent={replyContent}
              onReplyContentChange={setReplyContent}
              onSaveReply={() => handleSubmitReply(comment.id.toString())}
              onCancelReply={() => {
                setReplyTo(null);
                setReplyContent('');
              }}
              onKeyDown={handleKeyDown}
            />
          ))
        )}
      </div>

      {/* New Comment Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-3">
          <textarea
            ref={inputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleSubmitComment)}
            placeholder="Написать комментарий... (Ctrl+Enter для отправки)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Ctrl+Enter для отправки
            </span>
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || createCommentMutation.isPending}
              isLoading={createCommentMutation.isPending}
            >
              Отправить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onResolve: (resolved: boolean) => void;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (content: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  showReplyForm: boolean;
  replyContent: string;
  onReplyContentChange: (content: string) => void;
  onSaveReply: () => void;
  onCancelReply: () => void;
  onKeyDown: (e: React.KeyboardEvent, action: () => void) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  isEditing,
  editContent,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit,
  showReplyForm,
  replyContent,
  onReplyContentChange,
  onSaveReply,
  onCancelReply,
  onKeyDown
}) => {
  const isAuthor = comment.author === 1; // TODO: заменить на реальный ID пользователя из контекста

  return (
    <div className={`space-y-3 ${comment.parent ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-3">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {comment.author_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-sm text-gray-900">
                {comment.author_name}
              </div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), { 
                  addSuffix: true, 
                  locale: ru 
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {comment.is_resolved && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckIcon className="w-3 h-3 mr-1" />
                Решено
              </span>
            )}
            
            <div className="relative group">
              <button className="p-1 rounded hover:bg-gray-200 transition-colors">
                <EllipsisHorizontalIcon className="w-4 h-4 text-gray-600" />
              </button>
              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button
                  onClick={onReply}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                >
                  <ReplyIcon className="w-4 h-4" />
                  <span>Ответить</span>
                </button>
                {isAuthor && (
                  <>
                    <button
                      onClick={onEdit}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span>Редактировать</span>
                    </button>
                    <button
                      onClick={onDelete}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span>Удалить</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => onResolve(!comment.is_resolved)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                >
                  {comment.is_resolved ? (
                    <>
                      <XMarkIcon className="w-4 h-4" />
                      <span>Открыть</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Решить</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, onSaveEdit)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onCancelEdit}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={onSaveEdit}
                disabled={!editContent.trim()}
              >
                Сохранить
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {comment.content}
          </div>
        )}

        {/* Reply Button */}
        {!isEditing && (
          <button
            onClick={onReply}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
          >
            <ReplyIcon className="w-3 h-3" />
            <span>Ответить</span>
          </button>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="ml-6 border-l-2 border-gray-200 pl-4">
          <div className="space-y-2">
            <textarea
              value={replyContent}
              onChange={(e) => onReplyContentChange(e.target.value)}
              onKeyDown={(e) => onKeyDown(e, onSaveReply)}
              placeholder="Написать ответ... (Ctrl+Enter для отправки)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onCancelReply}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={onSaveReply}
                disabled={!replyContent.trim()}
              >
                Ответить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={() => {}} // Рекурсивные ответы не поддерживаются в MVP
              onEdit={() => {}}
              onDelete={() => {}}
              onResolve={() => {}}
              isEditing={false}
              editContent=""
              onEditContentChange={() => {}}
              onSaveEdit={() => {}}
              onCancelEdit={() => {}}
              showReplyForm={false}
              replyContent=""
              onReplyContentChange={() => {}}
              onSaveReply={() => {}}
              onCancelReply={() => {}}
              onKeyDown={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsPanel;
