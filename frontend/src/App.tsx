import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Тестируем импорты context-ов
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WorkspacePage from './pages/WorkspacePage';
import WorkspaceSettingsPage from './pages/WorkspaceSettingsPage';
import PageEditor from './pages/PageEditor';
import TaskBoardPage from './pages/TaskBoardPage';
import DatabasePage from './pages/DatabasePage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  React.useEffect(() => {
    // Глобальный обработчик ошибок React
    const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
      console.error('React Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Stack:', error.stack);
    };

    // Глобальный обработчик необработанных ошибок
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    };

    // Глобальный обработчик ошибок JavaScript
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global Error:', event.error);
      console.error('Error Message:', event.message);
      console.error('Error Filename:', event.filename);
      console.error('Error Lineno:', event.lineno);
      console.error('Error Colno:', event.colno);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardPage />} />
                <Route path="workspace/:workspaceId" element={<WorkspacePage />} />
                <Route path="workspace/:workspaceId/settings" element={<WorkspaceSettingsPage />} />
                <Route path="workspace/:workspaceId/page/:pageId" element={<PageEditor />} />
                <Route path="workspace/:workspaceId/tasks/:boardId" element={<TaskBoardPage />} />
                <Route path="workspace/:workspaceId/database/:databaseId" element={<DatabasePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              
              {/* Redirect any other route to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
