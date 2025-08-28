import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collaborationService, CollaborationEvent, ActiveUser } from '../services/websocketService';

interface UseCollaborationProps {
  workspaceId: string;
  resourceType: 'page' | 'database' | 'task';
  resourceId: string;
  enabled?: boolean;
}

interface CollaborationState {
  isConnected: boolean;
  activeUsers: ActiveUser[];
  isTyping: Record<string, boolean>;
  cursors: Record<string, any>;
  selections: Record<string, any>;
  error: string | null;
}

export const useCollaboration = ({
  workspaceId,
  resourceType,
  resourceId,
  enabled = true
}: UseCollaborationProps) => {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    activeUsers: [],
    isTyping: {},
    cursors: {},
    selections: {},
    error: null
  });

  const contentChangeCallbacks = useRef<Set<(event: CollaborationEvent) => void>>(new Set());
  const saveCallbacks = useRef<Set<(event: CollaborationEvent) => void>>(new Set());

  // Connect to collaboration room
  useEffect(() => {
    if (!enabled || !user || !token || !workspaceId || !resourceId) return;

    const connect = async () => {
      try {
        await collaborationService.joinResource(workspaceId, resourceType, resourceId, token);
        setState(prev => ({ ...prev, isConnected: true, error: null }));
      } catch (error) {
        console.error('Failed to connect to collaboration service:', error);
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          error: 'Failed to connect to collaboration service' 
        }));
      }
    };

    connect();

    return () => {
      collaborationService.leaveResource();
      setState(prev => ({ ...prev, isConnected: false }));
    };
  }, [enabled, user, token, workspaceId, resourceType, resourceId]);

  // Set up event listeners
  useEffect(() => {
    if (!state.isConnected) return;

    // User management events
    const handleUserJoined = (event: CollaborationEvent) => {
      console.log('User joined:', event.user_name);
      setState(prev => ({
        ...prev,
        activeUsers: prev.activeUsers.some(u => u.session_id === event.session_id)
          ? prev.activeUsers
          : [...prev.activeUsers, {
              user_id: event.user_id!,
              user_name: event.user_name!,
              session_id: event.session_id!,
              last_seen: event.timestamp!
            }]
      }));
    };

    const handleUserLeft = (event: CollaborationEvent) => {
      console.log('User left:', event.user_name);
      setState(prev => ({
        ...prev,
        activeUsers: prev.activeUsers.filter(u => u.session_id !== event.session_id),
        isTyping: Object.fromEntries(
          Object.entries(prev.isTyping).filter(([key]) => key !== event.session_id)
        ),
        cursors: Object.fromEntries(
          Object.entries(prev.cursors).filter(([key]) => key !== event.session_id)
        ),
        selections: Object.fromEntries(
          Object.entries(prev.selections).filter(([key]) => key !== event.session_id)
        )
      }));
    };

    const handleActiveUsers = (users: ActiveUser[]) => {
      setState(prev => ({ ...prev, activeUsers: users }));
    };

    // Content events
    const handleContentChange = (event: CollaborationEvent) => {
      contentChangeCallbacks.current.forEach(callback => callback(event));
    };

    const handleContentSaved = (event: CollaborationEvent) => {
      saveCallbacks.current.forEach(callback => callback(event));
    };

    // Cursor and selection events
    const handleCursorPosition = (event: CollaborationEvent) => {
      if (event.session_id) {
        setState(prev => ({
          ...prev,
          cursors: {
            ...prev.cursors,
            [event.session_id!]: {
              user_id: event.user_id,
              user_name: event.user_name,
              position: event.position
            }
          }
        }));
      }
    };

    const handleSelectionChange = (event: CollaborationEvent) => {
      if (event.session_id) {
        setState(prev => ({
          ...prev,
          selections: {
            ...prev.selections,
            [event.session_id!]: {
              user_id: event.user_id,
              user_name: event.user_name,
              selection: event.selection
            }
          }
        }));
      }
    };

    // Typing indicators
    const handleTypingStart = (event: CollaborationEvent) => {
      if (event.session_id) {
        setState(prev => ({
          ...prev,
          isTyping: { ...prev.isTyping, [event.session_id!]: true }
        }));
      }
    };

    const handleTypingStop = (event: CollaborationEvent) => {
      if (event.session_id) {
        setState(prev => ({
          ...prev,
          isTyping: { ...prev.isTyping, [event.session_id!]: false }
        }));
      }
    };

    const handleError = (error: any) => {
      setState(prev => ({ ...prev, error: error.message || 'Connection error' }));
    };

    // Register event listeners
    collaborationService.onUserJoined(handleUserJoined);
    collaborationService.onUserLeft(handleUserLeft);
    collaborationService.onActiveUsers(handleActiveUsers);
    collaborationService.onContentChange(handleContentChange);
    collaborationService.onContentSaved(handleContentSaved);
    collaborationService.onCursorPosition(handleCursorPosition);
    collaborationService.onSelectionChange(handleSelectionChange);
    collaborationService.onTypingStart(handleTypingStart);
    collaborationService.onTypingStop(handleTypingStop);
    collaborationService.onError(handleError);

    return () => {
      // Cleanup is handled by the service when disconnecting
    };
  }, [state.isConnected]);

  // Collaboration actions
  const sendContentChange = useCallback((changes: any[], version?: number) => {
    if (state.isConnected) {
      collaborationService.sendContentChange(changes, version);
    }
  }, [state.isConnected]);

  const sendCursorPosition = useCallback((position: any) => {
    if (state.isConnected) {
      collaborationService.sendCursorPosition(position);
    }
  }, [state.isConnected]);

  const sendSelection = useCallback((selection: any) => {
    if (state.isConnected) {
      collaborationService.sendSelection(selection);
    }
  }, [state.isConnected]);

  const saveContent = useCallback((content: any, version?: number) => {
    if (state.isConnected) {
      collaborationService.saveContent(content, version);
    }
  }, [state.isConnected]);

  const startTyping = useCallback(() => {
    if (state.isConnected) {
      collaborationService.startTyping();
    }
  }, [state.isConnected]);

  const stopTyping = useCallback(() => {
    if (state.isConnected) {
      collaborationService.stopTyping();
    }
  }, [state.isConnected]);

  // Event subscription methods
  const onContentChange = useCallback((callback: (event: CollaborationEvent) => void) => {
    contentChangeCallbacks.current.add(callback);
    return () => contentChangeCallbacks.current.delete(callback);
  }, []);

  const onSave = useCallback((callback: (event: CollaborationEvent) => void) => {
    saveCallbacks.current.add(callback);
    return () => saveCallbacks.current.delete(callback);
  }, []);

  return {
    // State
    isConnected: state.isConnected,
    activeUsers: state.activeUsers,
    isTyping: state.isTyping,
    cursors: state.cursors,
    selections: state.selections,
    error: state.error,

    // Actions
    sendContentChange,
    sendCursorPosition,
    sendSelection,
    saveContent,
    startTyping,
    stopTyping,

    // Event subscriptions
    onContentChange,
    onSave,

    // Computed
    currentUser: user,
    activeUsersList: state.activeUsers.filter(u => u.user_id !== user?.id),
    typingUsers: Object.entries(state.isTyping)
      .filter(([sessionId, isTyping]) => isTyping)
      .map(([sessionId]) => state.activeUsers.find(u => u.session_id === sessionId))
      .filter(Boolean) as ActiveUser[]
  };
};
