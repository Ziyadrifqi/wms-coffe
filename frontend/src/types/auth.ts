export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      roles: string[];
      permissions: string[];
    };
    token: string;
  };
}