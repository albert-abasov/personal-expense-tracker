export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}
