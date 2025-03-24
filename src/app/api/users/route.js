import prisma from "../../lib/prisma";

export async function GET() {
  try {
    // Fetch all users but exclude password
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true, // You can remove this if you don't want to expose emails
      },
    });

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
