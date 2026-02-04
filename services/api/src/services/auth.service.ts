import knex from '../database/connection';
import bcrypt from 'bcryptjs';
import { User } from '../types/user.types';

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
}
