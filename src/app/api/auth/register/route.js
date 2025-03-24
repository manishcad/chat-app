import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "../../../lib/prisma"; // Ensure Prisma is configured
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const image = formData.get("image"); // File input

    if (!name || !email || !password || !image) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Define the upload directory
    const uploadDir = path.join(process.cwd(), "public/uploads");

    // Ensure the directory exists
    await mkdir(uploadDir, { recursive: true });

    // Save the image file
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imagePath = path.join(uploadDir, image.name);

    await writeFile(imagePath, buffer); // Save image to public/uploads

    // Save user in DB with image path
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        image: `/uploads/${image.name}`, // Store image path
      },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "User already exists or invalid data" }, { status: 400 });
  }
}
