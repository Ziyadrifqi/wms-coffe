export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
}