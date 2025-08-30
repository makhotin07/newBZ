import React, { useState } from 'react';
import {
  XMarkIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { usePageComments, useCreateComment, useUpdateComment, useDeleteComment, useResolveComment } from '../../../../shared/hooks/useNotes';
import { Comment } from '../../api';
import { useAuth } from '../../../../app/providers/AuthProvider';
import LoadingSpinner from '../../../../shared/ui/LoadingSpinner';
import ConfirmModal from '../../../../shared/ui/ConfirmModal';

interface PageCommentsProps {
  pageId: string;
  onClose: () => void;
}

const PageComments: React.FC<PageCommentsProps> = ({ pageId, onClose }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data: comments, isLoading } = usePageComments(pageId);
  const createCommentMutation = useCreateComment(pageId);
  const updateCommentMutation = useUpdateComment(pageId);
  const deleteCommentMutation = useDeleteComment(pageId);
  const resolveCommentMutation = useResolveComment(pageId);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });

  const handleSubmitComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    const content = parentId ? (e.target as any).comment.value : newComment;
    if (!content.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        content: content.trim(),
        parent: parentId,
      });

      if (parentId) {
        setReplyingTo(null);
        (e.target as any).reset();
      } else {
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleEditComment = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    try {
      await updateCommentMutation.mutateAsync({
        id: commentId,
        content: editContent.trim(),
      });
      
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ 
    comment, 
    isReply = false 
  }) => {
    const isAuthor = user?.id === comment.author;
    const isEditing = editingComment === comment.id;

    return (
      <div className={`${isReply ? 'ml-8' : ''}`}>
        <div className="flex space-x-3 group">
          <div className="flex-shrink-0">
            {comment.author_avatar ? (
              <img
                src={comment.author_avatar}
                alt={comment.author_name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">
                  {comment.author_name?.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.author_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                  {comment.is_resolved && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  )}
                </div>

                {isAuthor && (
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <PencilIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setConfirm({ open: true, id: comment.id })}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={(e) => handleEditComment(e, comment.id)}>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex items-center justify-end space-x-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateCommentMutation.isPending}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="hover:text-blue-600"
              >
                Reply
              </button>
              <button
                onClick={() => resolveCommentMutation.mutate({ id: comment.id, resolved: !comment.is_resolved })}
                className={`hover:text-green-600 ${comment.is_resolved ? 'text-green-600' : ''}`}
              >
                {comment.is_resolved ? 'Снять решение' : 'Решить'}
              </button>
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <form onSubmit={(e) => handleSubmitComment(e, comment.id)} className="mt-3">
                <textarea
                  name="comment"
                  placeholder="Напишите ответ..."
                  className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
                <div className="flex items-center justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={createCommentMutation.isPending}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Ответить
                  </button>
                </div>
              </form>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-3">
                {comment.replies.map((reply: any) => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Comments</h3>
          {comments && (
            <span className="text-sm text-gray-500">
              ({comments.length})
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment: any) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-8">
            <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Пока нет комментариев</p>
            <p className="text-sm text-gray-400">Начните обсуждение</p>
          </div>
        )}
      </div>

      {/* New Comment Form */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={(e) => handleSubmitComment(e)}>
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">
                  {user?.first_name?.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Добавьте комментарий..."
                className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex items-center justify-end space-x-2 mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createCommentMutation.isPending ? 'Отправка...' : 'Отправить'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <ConfirmModal
        isOpen={confirm.open}
        title="Удалить комментарий?"
        message="Действие необратимо."
        confirmText="Удалить"
        cancelText="Отмена"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={() => {
          if (confirm.id) deleteCommentMutation.mutate(confirm.id);
          setConfirm({ open: false });
        }}
      />
    </div>
  );
};

export default PageComments;
