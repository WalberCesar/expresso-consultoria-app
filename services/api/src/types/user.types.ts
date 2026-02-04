export interface User {
  id: number;
  nome: string;
  email: string;
  senha: string;
  empresa_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserLoginRequest {
  email: string;
  senha: string;
}

export interface UserLoginResponse {
  token: string;
  user: {
    id: number;
    nome: string;
    email: string;
    empresa_id: number;
  };
}
