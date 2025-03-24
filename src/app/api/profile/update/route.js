import prisma from "../../../lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const image = formData.get("image");

    let imageUrl = null;
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadPath = path.join(process.cwd(), "public/uploads", image.name);
      await writeFile(uploadPath, buffer);
      imageUrl = `/uploads/${image.name}`;
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { name, image: imageUrl || undefined },
    });

    return Response.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error) {
    return Response.json({ error: "Update failed" }, { status: 400 });
  }
}
