export interface Comment {
  id: number;
  content: string;
  author: number;
  author_name: string;
  author_avatar: string;
  parent?: number | null;
  block?: string | null;
  is_resolved?: boolean;
  replies: Comment[];
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  content: string;
  parent?: number;
  block?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface ResolveCommentRequest {
  resolved: boolean;
}

export interface CommentsResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Comment[];
}
