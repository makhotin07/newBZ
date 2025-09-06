import React from 'react';
import { 
  ClockIcon, 
  PaperClipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Task } from '../../features/tasks/api';
import { ru } from '../../shared/config/locales/ru';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <ExclamationTriangleIcon className="w-3 h-3" />;
      default:
        return null;
    }
  };



  const isOverdue = task.is_overdue && task.status !== 'done';
  const isDueSoon = task.due_date && !task.is_overdue && task.status !== 'done' && 
    new Date(task.due_date).getTime() - Date.now() < 24 * 60 * 60 * 1000; // Due within 24h

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow ${
        isOverdue ? 'border-l-4 border-l-red-500' : 
        isDueSoon ? 'border-l-4 border-l-yellow-500' : ''
      }`}
    >
      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 2).map((tag: any) => (
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
          ))}
          {task.tags.length > 2 && (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Priority and Status */}
      <div className="flex items-center space-x-2 mb-3">
        {task.priority !== 'low' && (
          <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
            {getPriorityIcon(task.priority)}
            <span className="capitalize">{task.priority}</span>
          </span>
        )}
        
        {task.status === 'done' && (
          <CheckCircleIcon className="w-4 h-4 text-green-600" />
        )}
      </div>

      {/* Due Date */}
      {task.due_date && (
        <div className={`flex items-center space-x-1 text-xs mb-3 ${
          isOverdue ? 'text-red-600' : 
          isDueSoon ? 'text-yellow-600' : 
          'text-gray-600'
        }`}>
          <ClockIcon className="w-3 h-3" />
          <span>
            {isOverdue ? ru.tasks.overdue : 'Срок'} {new Date(task.due_date).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Assignees */}
      {task.assignees && task.assignees.length > 0 && (
        <div className="flex items-center mb-3">
          <div className="flex -space-x-1">
            {task.assignees.slice(0, 3).map((assignee: any, index: any) => (
              <div
                key={assignee.id}
                className="w-6 h-6 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center"
                title={assignee.name}
                style={{ zIndex: 10 - index }}
              >
                {assignee.avatar ? (
                  <img
                    src={assignee.avatar}
                    alt={assignee.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-blue-600 font-medium">
                    {assignee.name?.charAt(0) || assignee.email?.charAt(0)}
                  </span>
                )}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div 
                className="w-6 h-6 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center"
                style={{ zIndex: 6 }}
              >
                <span className="text-xs text-gray-600 font-medium">
                  +{task.assignees.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">

          
          {(task.attachments_count || 0) > 0 && (
            <div className="flex items-center space-x-1">
              <PaperClipIcon className="w-3 h-3" />
              <span>{task.attachments_count}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <UserIcon className="w-3 h-3" />
          <span>{task.created_by_name}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
