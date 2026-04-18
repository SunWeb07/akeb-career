import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const sessionSchema = z.object({
  student_id:           z.string(),
  counsellor_id:        z.string().optional(),
  session_date:         z.string().optional(),
  status:               z.enum(["scheduled", "completed", "cancelled"]).optional(),
  career_journey_stage: z.string().optional(),
  career_choice:        z.string().optional(),
  emerging_interest:    z.string().optional(),
  observations:         z.string().optional(),
  session_details:      z.string().optional(),
  student_tasks:        z.string().optional(),
  institution_tasks:    z.string().optional(),
  mindler_needed:       z.boolean().optional(),
  followup_required:    z.boolean().optional(),
  concluded:            z.boolean().optional(),
});

export async function GET() {
  const sessions = await prisma.session.findMany({
    include: { student: true },
    orderBy: { session_date: "asc" },
  });
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = sessionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const session = await prisma.session.create({
    data: {
      ...parsed.data,
      session_date: parsed.data.session_date ? new Date(parsed.data.session_date) : undefined,
    },
  });
  return NextResponse.json(session, { status: 201 });
}
