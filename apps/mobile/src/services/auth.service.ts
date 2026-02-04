import api from './api';

export interface LoginCredentials {
  login: string;
  senha: string;
}

export interface LoginResponse {
  usuario: {
    id: number;
    nome: string;
    login: string;
    empresa_id: number;
  };
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
};
