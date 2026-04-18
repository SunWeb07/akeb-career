import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ role: null }, { status: 400 });

  const profile = await prisma.profile.findUnique({
    where: { email },
    select: { role: true },
  });

  return NextResponse.json({ role: profile?.role ?? null });
}
