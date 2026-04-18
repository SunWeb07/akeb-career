import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const requestSchema = z.object({
  student_id: z.string(),
  type: z.string().min(1),
  status: z.enum(["pending", "in_progress", "resolved"]).optional(),
});

export async function GET() {
  const requests = await prisma.sessionRequest.findMany({
    include: { student: true },
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const newRequest = await prisma.sessionRequest.create({ data: parsed.data });
  return NextResponse.json(newRequest, { status: 201 });
}
