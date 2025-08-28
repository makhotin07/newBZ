import React from 'react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
