import { Request, Response, NextFunction } from 'express';

export class UserController {
  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Usuário não autenticado'
        });
        return;
      }

      res.status(200).json({
        message: 'Perfil do usuário autenticado',
        user: req.user
      });
    } catch (error) {
      next(error);
    }
  }
}
