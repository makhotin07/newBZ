import React, { useState } from 'react';
import { 
  ChatBubbleLeftIcon, 
  CheckCircleIcon,
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  created_at: string;
  is_resolved: boolean;
  replies?: Comment[];
}

interface CommentsPanelProps {
  pageId: string;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => void;
  onResolveComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

/**
 * Панель комментариев для side-panel
 */
const CommentsPanel: React.FC<CommentsPanelProps> = ({
  pageId,
  comments,
  onAddComment,
  onResolveComment,
  onDeleteComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleSubmitReply = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onAddComment(replyContent.trim(), parentId);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'только что';
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} ч. назад`;
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <ChatBubbleLeftIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Комментарии</h3>
          <span className="text-sm text-gray-500">({comments.length})</span>
        </div>
      </div>

      {/* Список комментариев */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Пока нет комментариев</p>
            <p className="text-sm">Добавьте первый комментарий</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Основной комментарий */}
              <div className={`p-3 rounded-lg border ${comment.is_resolved ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {comment.author.avatar ? (
                      <img 
                        src={comment.author.avatar} 
                        alt={comment.author.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {comment.author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onResolveComment(comment.id)}
                      className={`p-1 rounded ${
                        comment.is_resolved 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      aria-label={comment.is_resolved ? 'Отменить решение' : 'Решить'}
                    >
                      {comment.is_resolved ? (
                        <CheckCircleSolidIcon className="w-4 h-4" />
                      ) : (
                        <CheckCircleIcon className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      aria-label="Удалить комментарий"
                    >
                      <EllipsisHorizontalIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className={`mt-2 text-sm ${comment.is_resolved ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                  {comment.content}
                </div>

                {/* Кнопка ответа */}
                {!comment.is_resolved && (
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                  >
                    Ответить
                  </button>
                )}

                {/* Форма ответа */}
                {replyingTo === comment.id && (
                  <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Написать ответ..."
                      className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                    <div className="mt-2 flex space-x-2">
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Ответить
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Ответы */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-6 space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {reply.author.avatar ? (
                          <img 
                            src={reply.author.avatar} 
                            alt={reply.author.name}
                            className="w-4 h-4 rounded-full"
                          />
                        ) : (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                            {reply.author.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-medium text-gray-900">
                          {reply.author.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(reply.created_at)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-700">
                        {reply.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Форма добавления комментария */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmitComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Добавить комментарий..."
            className="w-full p-3 text-sm border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentsPanel;
