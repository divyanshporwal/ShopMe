import { verifyToken } from "@/lib/jwt";
import User from "@/models/user.model";
import { cookies } from "next/headers";

export async function getAuthUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Not authenticated");
  }

  const decoded = verifyToken(token);

  const user = await User.findById(decoded.id);

  if (!user) throw new Error("User not found");

  return user;
}