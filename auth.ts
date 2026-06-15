import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { sql } from "@app/lib/db";
import bcrypt from "bcrypt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        emailOrPhone: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const emailOrPhone = credentials?.emailOrPhone as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!emailOrPhone || !password) return null;

        // 1. Fallback to Demo Mode if Database is not connected
        if (!sql) {
          console.warn("[Auth] No DATABASE_URL found. Running in Demo Mode.");
          if (emailOrPhone.includes("@") && password === "password123") {
            return {
              id: "demo-user",
              name: "Demo User",
              email: emailOrPhone,
              image: null,
            };
          }
          return null;
        }

        // 2. Query Supabase DB
        try {
          const users = await sql`
            SELECT id, name, email, phone, password, image 
            FROM users 
            WHERE email = ${emailOrPhone} OR phone = ${emailOrPhone} 
            LIMIT 1
          `;

          if (users.length === 0) return null;

          const user = users[0];
          const isPasswordCorrect = await bcrypt.compare(password, user.password);

          if (isPasswordCorrect) {
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              image: user.image || null,
            };
          }
        } catch (error) {
          console.error("[Auth] Database authorize error:", error);
        }

        return null;
      },
    }),
  ],
});
