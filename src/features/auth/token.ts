import { SignJWT, jwtVerify } from "jose";
import { env } from "@/config/env";

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

export const signToken = async (payload: any, expiresIn: string | number = env.JWT_EXPIRES_IN) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn as string)
    .sign(secretKey);
};

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
};
