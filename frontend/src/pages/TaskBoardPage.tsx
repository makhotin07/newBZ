import React from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskBoardsList from '../components/tasks/TaskBoardsList';

const TaskBoardPage: React.FC = () => {
  const { workspaceId, boardId } = useParams<{ workspaceId: string; boardId?: string }>();

  if (!workspaceId) {
    return <div>Invalid workspace ID</div>;
  }

  return (
    <div className="h-full">
      {boardId ? (
        <KanbanBoard boardId={boardId} workspaceId={workspaceId} />
      ) : (
        <div className="p-8">
          <TaskBoardsList workspaceId={workspaceId} />
        </div>
      )}
    </div>
  );
};

export default TaskBoardPage;