import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const taskSchema = z.object({
  student_id: z.string(),
  session_id: z.string(),
  assigned_to: z.string(),
  type: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(["pending", "in_progress", "done"]).optional(),
});

export async function GET() {
  const tasks = await prisma.task.findMany({
    include: { student: true, session: true },
    orderBy: { created_at: "asc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = taskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const task = await prisma.task.create({ data: parsed.data });
  return NextResponse.json(task, { status: 201 });
}
