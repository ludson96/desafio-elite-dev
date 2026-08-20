import bcrypt from "bcryptjs";
import { userRepository, type UserRepository } from "../repositories/user.repository.js";
import { generateToken, type TokenPayload } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema.js";

export class AuthService {
  constructor(private userRepositoryInstance: UserRepository = userRepository) {}

  async register(data: RegisterInput) {
    const userExists = await this.userRepositoryInstance.findByEmail(data.email);

    if (userExists) {
      throw new AppError("E-mail já cadastrado na plataforma", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.userRepositoryInstance.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    });

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role as "ORGANIZER" | "CLIENT" | "GATEKEEPER",
    };

    const token = generateToken(tokenPayload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async login(data: LoginInput) {
    const user = await this.userRepositoryInstance.findByEmail(data.email);

    if (!user) {
      throw new AppError("E-mail ou senha incorretos", 401);
    }

    const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);

    if (!passwordMatch) {
      throw new AppError("E-mail ou senha incorretos", 401);
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role as "ORGANIZER" | "CLIENT" | "GATEKEEPER",
    };

    const token = generateToken(tokenPayload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepositoryInstance.findById(userId);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
