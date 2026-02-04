import knex from '../database/connection';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserLoginResponse } from '../types/user.types';

export class AuthService {
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await knex<User>('usuarios')
      .where({ email })
      .first();

    return user || null;
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async generateToken(user: User): Promise<UserLoginResponse> {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    if (!secret) {
      throw new Error('JWT_SECRET não configurado');
    }

    const payload = {
      id: user.id,
      email: user.email,
      empresa_id: user.empresa_id
    };

    const token = jwt.sign(payload, secret, { expiresIn });

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        empresa_id: user.empresa_id
      }
    };
  }
}
