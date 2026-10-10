import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase } from "./mongodb";
import User from "@/models/User";
import { toPlain } from "./serialize";
import type { IUser } from "@/types";

const JWT_SECRET =
  process.env.AUTH_SECRET || process.env.JWT_SECRET || "fallback_secret_for_dev_only";

export interface TokenPayload {
  userId: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function getAuthUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<IUser | null> {
  const payload = await getAuthUser();
  if (!payload) return null;

  await connectToDatabase();
  const user = await User.findById(payload.userId).select("-password").lean();
  if (!user) return null;

  return toPlain<IUser>(user);
}
