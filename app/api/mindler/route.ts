import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  student_id:      z.string(),
  mindler_id:      z.string().optional(),
  mindler_password: z.string().optional(),
  result_summary:  z.string().optional(),
  status:          z.enum(["pending", "done"]).optional(),
});

export async function GET() {
  const assessments = await prisma.mindlerAssessment.findMany({
    include: { student: { select: { full_name: true, akeb_id: true, school_grade: true, council: true } } },
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json(assessments);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Upsert — if student already has assessment, update it
  const assessment = await prisma.mindlerAssessment.upsert({
    where:  { student_id: parsed.data.student_id },
    create: parsed.data,
    update: parsed.data,
  });
  return NextResponse.json(assessment, { status: 201 });
}
