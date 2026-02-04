import api from './api';

export interface LoginCredentials {
  login: string;
  senha: string;
}

export interface LoginResponse {
  user: {
    id: number;
    nome: string;
    login: string;
    empresa_id: number;
  };
  token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // const payload = {
    //   email: "usuario.a@empresaa.com",
    //   senha: "senha123"
    // };

    const payload = {
      email: "usuario.b@empresab.com",
      senha: "senha456"
    };

    console.log("payload", payload);

    const response = await api.post<LoginResponse>('/api/auth/login', payload);
    console.log("response", response.data);
    return response.data;
  },
};
