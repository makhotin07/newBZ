import React from 'react';
import { useParams } from 'react-router-dom';
import WorkspaceSettings from '../components/workspace/WorkspaceSettings';

const WorkspaceSettingsPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  if (!workspaceId) {
    return <div>Invalid workspace ID</div>;
  }

  return (
    <div className="p-8">
      <WorkspaceSettings workspaceId={workspaceId} />
    </div>
  );
};

export default WorkspaceSettingsPage;
