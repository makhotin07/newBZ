import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  TableCellsIcon, 
  PlusIcon, 
  ArrowLeftIcon,
  FunnelIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { useDatabase, useDatabaseRecords } from '../shared/hooks/useDatabases';
import DatabasesList from '../widgets/DatabaseTable/DatabasesList';
import LoadingSpinner from '../shared/ui/LoadingSpinner';
import CreateRecordModal from '../widgets/DatabaseTable/CreateRecordModal';
import CreatePropertyModal from '../features/databases/ui/CreatePropertyModal';



const DatabasePage: React.FC = () => {
  const { workspaceId, databaseId } = useParams<{ workspaceId: string; databaseId?: string }>();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'table' | 'grid' | 'calendar' | 'kanban' | 'gallery'>('table');
  const [showCreateRecordModal, setShowCreateRecordModal] = useState(false);
  const [showCreatePropertyModal, setShowCreatePropertyModal] = useState(false);

  const { data: database, isLoading: databaseLoading, error: databaseError } = useDatabase(databaseId || '');
  const { data: records, isLoading: recordsLoading } = useDatabaseRecords(databaseId || '');

  // Heuristic: подобрать ключ свойства в record.properties по имени и типу
  const findPropKey = (types: string[]): string | null => {
    const props: any[] = (database as any)?.properties || [];
    const first = (records as any)?.results?.[0];
    const keys: string[] = first && first.properties ? Object.keys(first.properties) : [];
    for (const p of props) {
      if (!p || typeof p !== 'object') continue;
      if (!types.includes(p.type)) continue;
      // точное совпадение имени
      if (keys.includes(p.name)) return p.name;
      // регистронезависимое совпадение
      const k = keys.find(k => k.toLowerCase() === String(p.name || '').toLowerCase());
      if (k) return k;
    }
    return null;
  };

  const handleBack = () => {
    if (workspaceId) {
      navigate(`/workspace/${workspaceId}/databases`);
    } else {
      navigate('/');
    }
  };

  const handleAddRecord = () => {
    setShowCreateRecordModal(true);
  };





  if (!workspaceId) {
    return <div className="p-8 text-center text-gray-500">Неверный ID рабочего пространства</div>;
  }

  if (!databaseId) {
    return (
      <div className="p-8">
        <DatabasesList workspaceId={workspaceId} />
      </div>
    );
  }

  if (databaseLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (databaseError || !database) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">База данных не найдена</h3>
            <p className="mt-1 text-sm text-gray-500">
              Возможно, база данных была удалена или у вас нет доступа к ней.
            </p>
            <div className="mt-6">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Вернуться к списку
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <TableCellsIcon className="w-6 h-6 text-green-600" />
            <div>
              <h1 className="text-lg font-medium text-gray-900">
                {(database as any).title || 'Без названия'}
              </h1>
              <p className="text-sm text-gray-500">
                в {(database as any).workspace_name || 'Рабочем пространстве'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAddRecord}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Добавить запись
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <FunnelIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'table', name: 'Таблица' },
              { id: 'grid', name: 'Сетка' },
              { id: 'calendar', name: 'Календарь' },
              { id: 'kanban', name: 'Канбан' },
              { id: 'gallery', name: 'Галерея' },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id as any)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm
                  ${currentView === view.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {view.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="p-6">
          {(database as any).description && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">{(database as any).description}</p>
            </div>
          )}

          {/* Database Properties */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Свойства базы данных</h3>
                <button
                  onClick={() => setShowCreatePropertyModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Добавить свойство
                </button>
              </div>
            </div>
            {(database as any).properties && (database as any).properties.length > 0 ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(database as any).properties.map((property: any) => {
                    console.log('Database property:', property);
                    if (!property || typeof property !== 'object') {
                      console.warn('Invalid database property:', property);
                      return null;
                    }
                    return (
                      <div key={property.id || 'неизвестно'} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{typeof property.name === 'string' ? property.name : 'Без названия'}</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {typeof property.type === 'string' ? property.type : 'Неизвестный тип'}
                          </span>
                        </div>
                        {property.config?.required === true && (
                          <span className="text-xs text-red-600">Обязательное</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500 mb-4">У базы данных пока нет свойств</p>
                <button
                  onClick={() => setShowCreatePropertyModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Создать первое свойство
                </button>
              </div>
            )}
          </div>

          {/* Records View (table/grid/calendar) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Записи</h3>
                <span className="text-sm text-gray-500">
                  {(records as any)?.length || 0} записей
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {recordsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : (records as any)?.length ? (
                <>
                  {currentView === 'table' && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Свойства</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Создано</th>

                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(records as any).map((record: any) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.id.slice(0, 8)}...</td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="max-w-md">
                                  {record.properties && typeof record.properties === 'object'
                                    ? Object.entries(record.properties)
                                        .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
                                        .join(', ')
                                    : 'Нет свойств'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(record.created_at).toLocaleDateString('ru-RU')}</td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {currentView === 'grid' && (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {(records as any).map((record: any) => (
                        <div key={record.id} className="border rounded-lg p-4 hover:shadow">
                          <div className="text-xs text-gray-500 mb-2">{record.id.slice(0,8)}...</div>
                          <div className="text-sm text-gray-900">
                            {record.properties && typeof record.properties === 'object'
                              ? Object.entries(record.properties)
                                  .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
                                  .join('\n')
                              : 'Нет свойств'}
                          </div>
                          <div className="text-xs text-gray-500 mt-3">{new Date(record.created_at).toLocaleDateString('ru-RU')}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {currentView === 'calendar' && (
                    <div>
                      {(() => {
                        const datePropKey = findPropKey(['date']);
                        if (!datePropKey) {
                          return (
                            <div className="text-sm text-gray-600">
                              Для календаря нужна колонка типа "date". Добавьте свойство даты в базу данных.
                            </div>
                          );
                        }
                        const groups: Record<string, any[]> = {};
                        for (const rec of (records as any)) {
                          const raw = rec?.properties?.[datePropKey];
                          const d = raw ? new Date(raw) : null;
                          const key = d ? d.toLocaleDateString('ru-RU') : 'Без даты';
                          (groups[key] = groups[key] || []).push(rec);
                        }
                        return (
                          <div className="space-y-6">
                            {Object.entries(groups).map(([day, list]) => (
                              <div key={day} className="border rounded-lg">
                                <div className="px-4 py-2 border-b text-sm font-medium text-gray-700 bg-gray-50">{day}</div>
                                <div className="p-4 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                  {list.map((rec: any) => (
                                    <div key={rec.id} className="border rounded p-3">
                                      <div className="text-xs text-gray-500 mb-1">{rec.id.slice(0,8)}...</div>
                                      <div className="text-sm text-gray-900 truncate">
                                        {rec.properties && typeof rec.properties === 'object'
                                          ? Object.entries(rec.properties)
                                              .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                                              .join(', ')
                                          : 'Нет свойств'}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {currentView === 'kanban' && (
                    <div>
                      {(() => {
                        const statusKey = findPropKey(['select','status','multi_select']);
                        if (!statusKey) {
                          return <div className="text-sm text-gray-600">Для канбана нужна колонка типа select/status.</div>;
                        }
                        const groups: Record<string, any[]> = {};
                        for (const rec of (records as any)) {
                          const raw = rec?.properties?.[statusKey];
                          const arr = Array.isArray(raw) ? raw : [raw];
                          if (!arr || arr.length === 0) {
                            (groups['Без статуса'] = groups['Без статуса'] || []).push(rec);
                          } else {
                            for (const v of arr) {
                              const label = (typeof v === 'object' && v?.label) ? v.label : (v ?? 'Без статуса');
                              (groups[label] = groups[label] || []).push(rec);
                            }
                          }
                        }
                        const cols = Object.keys(groups);
                        return (
                          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            {cols.map(c => (
                              <div key={c} className="border rounded-lg bg-gray-50">
                                <div className="px-3 py-2 border-b font-medium text-sm text-gray-700">{c}</div>
                                <div className="p-3 space-y-3 min-h-[80px]">
                                  {groups[c].map((rec:any) => (
                                    <div key={rec.id} className="bg-white border rounded p-3 shadow-sm">
                                      <div className="text-sm text-gray-900 truncate">
                                        {rec.properties && typeof rec.properties === 'object'
                                          ? Object.entries(rec.properties)
                                              .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
                                              .join(', ')
                                          : 'Нет свойств'}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">{new Date(rec.created_at).toLocaleDateString('ru-RU')}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  {currentView === 'gallery' && (
                    <div>
                      {(() => {
                        const mediaKey = findPropKey(['file','image','url','cover']);
                        if (!mediaKey) {
                          return <div className="text-sm text-gray-600">Для галереи нужна колонка типа file/image/url.</div>;
                        }
                        return (
                          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {(records as any).map((rec:any) => {
                              const src = rec?.properties?.[mediaKey];
                              const url = typeof src === 'string' ? src : (src?.url || src?.path || null);
                              return (
                                <div key={rec.id} className="border rounded overflow-hidden bg-white">
                                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                                    {url ? (
                                      <img src={url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-xs text-gray-500">Нет изображения</span>
                                    )}
                                  </div>
                                  <div className="p-2 text-xs text-gray-700 truncate">{rec.id.slice(0,8)}...</div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Нет записей</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Начните с создания первой записи в этой базе данных.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleAddRecord}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Добавить первую запись
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Record Modal */}
      {database && (
        <CreateRecordModal
          isOpen={showCreateRecordModal}
          onClose={() => setShowCreateRecordModal(false)}
          databaseId={(database as any).id}
                      properties={(() => {
              console.log('Database properties:', (database as any).properties);
              return (database as any).properties || [];
            })()}
        />
      )}

      {/* Create Property Modal */}
      {database && (
        <CreatePropertyModal
          databaseId={(database as any).id}
          isOpen={showCreatePropertyModal}
          onClose={() => setShowCreatePropertyModal(false)}
        />
      )}


    </div>
  );
};

export default DatabasePage;