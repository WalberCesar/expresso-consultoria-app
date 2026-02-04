import { Request, Response, NextFunction } from 'express';
import { UserLoginRequest } from '../types/user.types';

export class AuthController {
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

      res.status(501).json({
        message: 'Login endpoint - implementação pendente'
      });
    } catch (error) {
      next(error);
    }
  }
}
