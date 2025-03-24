import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

export async function getUserFromToken() {
  try {
    const cookieStore = await cookies(); // Await cookies()
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return null;

    const decoded = verify(token, process.env.JWT_SECRET);
    return decoded; // Return user data from token
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}
