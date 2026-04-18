import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "./supabase-server";
import { prisma } from "./prisma";

export async function getUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getUserProfile() {
  const user = await getUser();
  if (!user?.email) return null;
  return prisma.profile.findUnique({ where: { email: user.email } });
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

// Redirects to /login if the authenticated user's role is not in the allowed list
export async function requireRole(allowed: string[]) {
  const profile = await getUserProfile();
  if (!profile || !allowed.includes(profile.role)) redirect("/login");
  return profile;
}
