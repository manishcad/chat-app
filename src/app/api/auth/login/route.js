import { compare } from "bcryptjs";
import prisma from "../../../lib/prisma";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const bodyText = await req.text();
    console.log("Raw Request Body:", bodyText); // Log the raw request body

    if (!bodyText) {
      return new Response(JSON.stringify({ error: "Request body is empty {email,password} is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON format!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { email, password } = body

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Both fields are required!" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find user in database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid email or password!" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check password
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid email or password!" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate JWT token
    const cookiesStore = await cookies();
    const token = sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    cookiesStore.set("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });


    const { password: _, ...safeUser } = user;
    return new Response(JSON.stringify({ success: true, user:safeUser }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong!" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
