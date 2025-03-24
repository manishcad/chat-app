import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "../../lib/prisma"; // Ensure your Prisma client is properly imported

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    console.log(session,"look here")
    console.log(session.user?.id,"look here sadsa")

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const senderId = session.user.id; // Ensure senderId is defined
    const { receiverId, content } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json({ error: "Missing receiverId or content" }, { status: 400 });
    }

    console.log("Sender ID:", senderId);
    console.log("Receiver ID:", receiverId);

    // Save the message to the database
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
  }
}
