import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "../../../lib/prisma";
import bcrypt from "bcrypt";



export const authOptions = {
  adapter: PrismaAdapter(prisma), // Use Prisma adapter for DB sessions
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "example@mail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) {
          throw new Error("Please enter both email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!passwordMatch) {
          throw new Error("Invalid password");
        }
        console.log(user.image,"image lookk here")
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image || "/uploads/user.png", // Ensure a default image if none exists
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image, // Ensure this updates
      };
        if (token) {
          session.user.id = token.id; // ✅ Ensure `id` is passed in session
         
        }
        return session;
      },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.image = user.image;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure you have this in .env
  session: {
    strategy: "jwt", // Store session in JWT
  },
  pages: {
    signIn: "/auth/login", // Custom login page
  },
};
const handler=NextAuth(authOptions)

export {handler as POST,handler as GET}
