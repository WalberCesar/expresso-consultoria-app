import { Request, Response, NextFunction } from 'express';
import { UserLoginRequest } from '../types/user.types';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async handleLogin(
    req: Request<{}, {}, UserLoginRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        res.status(400).json({
          error: 'Email e senha são obrigatórios'
        });
        return;
      }

      const user = await this.authService.findUserByEmail(email);

      if (!user) {
        res.status(401).json({
          error: 'Credenciais inválidas'
        });
        return;
      }

      const isPasswordValid = await this.authService.validatePassword(
        senha,
        user.senha
      );

      if (!isPasswordValid) {
        res.status(401).json({
          error: 'Credenciais inválidas'
        });
        return;
      }

      res.status(501).json({
        message: 'Geração de JWT - implementação pendente'
      });
    } catch (error) {
      next(error);
    }
  }
}
