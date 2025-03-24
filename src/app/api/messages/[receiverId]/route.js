import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req, context) {
  const params = await context.params; // ✅ Await params before using it
   // Debugging

  const { receiverId } = params; // Now safe to destructure
  if (!receiverId) {
    return new Response(JSON.stringify({ error: "receiverId is required" }), { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const userId = session.user.id;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId },
          { senderId: receiverId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch messages" }), { status: 500 });
  }
}
