import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const completeSchema = z.object({
  mindler_id:       z.string().optional(),
  mindler_password: z.string().optional(),
  result_summary:   z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const assessment = await prisma.mindlerAssessment.update({
    where: { id },
    data: { ...parsed.data, status: "done" },
  });
  return NextResponse.json(assessment);
}
