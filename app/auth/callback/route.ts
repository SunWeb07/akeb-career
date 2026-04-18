import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

const roleHome: Record<string, string> = {
  admin:       "/dashboard",
  counsellor:  "/counsellor",
  institution: "/institution",
  student:     "/student",
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user?.email) {
      const profile = await prisma.profile.findUnique({
        where: { email: data.user.email },
        select: { role: true },
      });
      const home = roleHome[profile?.role ?? ""] ?? "/dashboard";
      return NextResponse.redirect(`${origin}${home}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
