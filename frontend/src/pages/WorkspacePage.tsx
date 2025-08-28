import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { 
  DocumentIcon, 
  TableCellsIcon, 
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

import PageList from '../components/pages/PageList';
import TaskBoardsList from '../components/tasks/TaskBoardsList';
import DatabasesList from '../components/database/DatabasesList';

const WorkspacePage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [selectedTab, setSelectedTab] = useState(0);

  if (!workspaceId) {
    return <div>Invalid workspace ID</div>;
  }

  const tabs = [
    { name: 'Страницы', icon: DocumentIcon, component: 'pages' },
    { name: 'Базы данных', icon: TableCellsIcon, component: 'databases' },
    { name: 'Доски задач', icon: ClipboardDocumentListIcon, component: 'tasks' },
    { name: 'Шаблоны', icon: DocumentDuplicateIcon, component: 'templates' },
    { name: 'Архив', icon: ArchiveBoxIcon, component: 'archived' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Рабочее пространство
          </h1>
          
          {/* Settings Button */}
          <Link
            to={`/workspace/${workspaceId}/settings`}
            className="btn-secondary flex items-center space-x-2"
          >
            <Cog6ToothIcon className="w-5 h-5" />
            <span>Настройки</span>
          </Link>
        </div>

        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 transition-all
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
                     ${selected
                       ? 'bg-white text-blue-700 shadow'
                       : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                     }`
                  }
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </div>
                </Tab>
              );
            })}
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <PageList workspaceId={workspaceId} />
            </Tab.Panel>
            
            <Tab.Panel>
              <DatabasesList workspaceId={workspaceId} />
            </Tab.Panel>
            
            <Tab.Panel>
              <TaskBoardsList workspaceId={workspaceId} />
            </Tab.Panel>
            
            <Tab.Panel>
              <PageList workspaceId={workspaceId} showTemplates={true} />
            </Tab.Panel>
            
            <Tab.Panel>
              <PageList workspaceId={workspaceId} showArchived={true} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default WorkspacePage;
