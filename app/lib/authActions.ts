"use server";

import { signIn } from "@/auth";
import { sql } from "./db";
import bcrypt from "bcrypt";
import { AuthError } from "next-auth";

export async function loginWithCredentials(prevState: string | undefined, formData: FormData) {
  const emailOrPhone = formData.get("emailOrPhone") as string;
  const password = formData.get("password") as string;
  //a more sophisticated logic must replace this
  if (!emailOrPhone || !password) {
    return "Please enter your email/phone and password.";
  }

  try {
    await signIn("credentials", {
      emailOrPhone,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid email/phone or password.";
        default:
          return "Something went wrong. Please try again.";
      }
    }
    throw error; // Next.js redirects work by throwing a special redirect error, so we must rethrow it
  }
}

export async function registerWithCredentials(prevState: string | undefined, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return "Name, Email, and Password are required.";
  }

  if (!sql) {
    return "Registration is disabled in Demo Mode. Please log in with email and password 'password123'.";
  }

  try {
    // 1. Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users 
      WHERE email = ${email} OR (phone = ${phone || null} AND phone IS NOT NULL) 
      LIMIT 1
    `;
    if (existingUser.length > 0) {
      return "User with this email or phone already exists.";
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert user into Supabase
    await sql`
      INSERT INTO users (name, email, phone, password)
      VALUES (${name}, ${email}, ${phone || null}, ${hashedPassword})
    `;

    // 4. Sign in automatically
    await signIn("credentials", {
      emailOrPhone: email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "NEXT_REDIRECT" || (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))) {
      throw error;
    }
    if (error instanceof AuthError) {
      return "Registration successful, but failed to log in automatically. Please log in manually.";
    }
    console.error("[AuthActions] Registration error:", error);
    return "Failed to register. Please try again.";
  }
}
