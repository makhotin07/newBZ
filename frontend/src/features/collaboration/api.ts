

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
}

export interface CollaborationEvent {
  type: 'content_change' | 'cursor_position' | 'selection_change' | 'user_joined' | 'user_left' | 'typing_start' | 'typing_stop' | 'content_saved';
  user_id?: string;
  user_name?: string;
  session_id?: string;
  changes?: any[];
  position?: any;
  selection?: any;
  content?: any;
  version?: number;
  timestamp?: string;
}

export interface ActiveUser {
  user_id: string;
  user_name: string;
  session_id: string;
  last_seen: string;
}

export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();
  private connectionParams: { url: string; token?: string } | null = null;

  constructor(private baseUrl: string = 'ws://localhost:8000') {}

  connect(url: string, token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Сохраняем параметры для переподключения
        this.connectionParams = { url, token };
        
        // Формируем правильный WebSocket URL
        const wsUrl = `${this.baseUrl}${url.startsWith('/') ? url : `/${url}`}${token ? `?token=${token}` : ''}`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          
          // Запускаем keep-alive
          this.startKeepAlive();
          
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.handleDisconnect();
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Normal closure');
      this.socket = null;
    }
    this.listeners.clear();
    this.connectionParams = null;
    this.reconnectAttempts = 0;
  }

  send(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  on(eventType: string, callback: Function): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  off(eventType: string, callback?: Function): void {
    if (callback) {
      this.listeners.get(eventType)?.delete(callback);
    } else {
      this.listeners.delete(eventType);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const { type, ...data } = message;
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }

    // Global message handler
    const globalCallbacks = this.listeners.get('*');
    if (globalCallbacks) {
      globalCallbacks.forEach(callback => callback(message));
    }
  }

  private handleDisconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.connectionParams) {
      setTimeout(async () => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        try {
          if (this.connectionParams) {
            await this.connect(this.connectionParams.url, this.connectionParams.token);
          }
        } catch (error) {
          console.error('Reconnection failed:', error);
        }
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    } else {
      console.log('Max reconnection attempts reached');
    }
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private startKeepAlive(): void {
    // Отправляем ping каждые 30 секунд
    setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000);
  }
}

export class CollaborationService {
  private ws: WebSocketService;
  private currentResource: { workspaceId: string; resourceType: string; resourceId: string } | null = null;

  constructor(baseUrl?: string) {
    this.ws = new WebSocketService(baseUrl);
  }

  async joinResource(workspaceId: string, resourceType: string, resourceId: string, token: string): Promise<void> {
    if (this.currentResource) {
      this.leaveResource();
    }

    this.currentResource = { workspaceId, resourceType, resourceId };
    const url = `ws/collab/${workspaceId}/${resourceType}/${resourceId}/`;
    
    await this.ws.connect(url, token);
  }

  leaveResource(): void {
    this.ws.disconnect();
    this.currentResource = null;
  }

  // Content collaboration methods
  sendContentChange(changes: any[], version?: number): void {
    this.ws.send({
      type: 'content_change',
      data: { changes, version }
    });
  }

  sendCursorPosition(position: any): void {
    this.ws.send({
      type: 'cursor_position',
      data: { position }
    });
  }

  sendSelection(selection: any): void {
    this.ws.send({
      type: 'selection_change',
      data: { selection }
    });
  }

  saveContent(content: any, version?: number): void {
    this.ws.send({
      type: 'save_content',
      data: { content, version }
    });
  }

  startTyping(): void {
    this.ws.send({
      type: 'typing_start',
      data: {}
    });
  }

  stopTyping(): void {
    this.ws.send({
      type: 'typing_stop',
      data: {}
    });
  }

  // Event listeners
  onContentChange(callback: (event: CollaborationEvent) => void): void {
    this.ws.on('content_change', callback);
  }

  onCursorPosition(callback: (event: CollaborationEvent) => void): void {
    this.ws.on('cursor_position', callback);
  }

  onSelectionChange(callback: (event: CollaborationEvent) => void): void {
    this.ws.on('selection_change', callback);
  }

  onUserJoined(callback: (event: CollaborationEvent) => void): void {
    this.ws.on('user_joined', callback);
  }

  onUserLeft(callback: (event: CollaborationEvent) => void): void {
    this.ws.on('user_left', callback);
  }

  onActiveUsers(callback: (users: ActiveUser[]) => void): void {
    this.ws.on('active_users', (data: any) => callback(data.users));
  }

  onTypingStart(callback: (event: CollaborationEvent) => void): void {
    this.ws.on('typing_start', callback);
  }

  onTypingStop(callback: (event: CollaborationEvent) => void): void {
    this.ws.on('typing_stop', callback);
  }

  onContentSaved(callback: (event: CollaborationEvent) => void): void {
    this.ws.on('content_saved', callback);
  }

  onError(callback: (error: any) => void): void {
    this.ws.on('error', callback);
  }

  get isConnected(): boolean {
    return this.ws.isConnected;
  }
}

export class NotificationService {
  private ws: WebSocketService;

  constructor(baseUrl?: string) {
    this.ws = new WebSocketService(baseUrl);
  }

  async connect(token: string): Promise<void> {
    await this.ws.connect('ws/notifications/', token);
  }

  disconnect(): void {
    this.ws.disconnect();
  }

  markAsRead(notificationId: string): void {
    this.ws.send({
      type: 'mark_read',
      data: { notification_id: notificationId }
    });
  }

  onNotification(callback: (notification: any) => void): void {
    this.ws.on('notification_message', callback);
  }

  get isConnected(): boolean {
    return this.ws.isConnected;
  }
}

// Global instances
export const collaborationService = new CollaborationService();
export const notificationService = new NotificationService();

export default WebSocketService;
