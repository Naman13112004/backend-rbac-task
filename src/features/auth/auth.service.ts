import bcrypt from "bcrypt";
import db from "@/lib/db";
import { signToken } from "./token";
import { z } from "zod";
import { RegisterSchema, LoginSchema } from "./auth.schema";

export const register = async (data: z.infer<typeof RegisterSchema>) => {
  const { email, password, name, role } = data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: role || "USER",
    },
  });

  // Exclude password from the returned object safely
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const login = async (data: z.infer<typeof LoginSchema>) => {
  const { email, password } = data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = await signToken({ userId: user.id, role: user.role });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};
