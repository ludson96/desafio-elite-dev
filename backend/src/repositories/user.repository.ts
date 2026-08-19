import { prisma } from "../lib/prisma.js";
import type { User, UserRole } from "../generated/prisma/client.js";



export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }


}

export const userRepository = new UserRepository();
