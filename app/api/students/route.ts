import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const studentSchema = z.object({
  akeb_id:           z.string().min(1),
  full_name:         z.string().min(1),
  email:             z.string().email().optional().or(z.literal("")),
  contact_number:    z.string().optional(),
  gender:            z.string().optional(),
  school_grade:      z.string().optional(),
  school_name:       z.string().optional(),
  curriculum:        z.string().optional(),
  category:          z.string().optional(),
  council:           z.string().optional(),
  centre:            z.string().optional(),
  fmp_swb_id:        z.string().optional(),
  background:        z.string().optional(),
  concluded:         z.boolean().optional(),
  registration_date: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const students = await prisma.student.findMany({
    where: q
      ? {
          OR: [
            { full_name: { contains: q, mode: "insensitive" } },
            { akeb_id:   { contains: q, mode: "insensitive" } },
            { email:     { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { created_at: "desc" },
    take: q ? 20 : 200,
  });
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = studentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.student.findUnique({
    where: { akeb_id: parsed.data.akeb_id },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A student with this AKEB ID already exists" },
      { status: 409 }
    );
  }

  const student = await prisma.student.create({
    data: {
      ...parsed.data,
      registration_date: parsed.data.registration_date
        ? new Date(parsed.data.registration_date)
        : undefined,
    },
  });
  return NextResponse.json(student, { status: 201 });
}
