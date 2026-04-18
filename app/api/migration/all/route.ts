import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const studentSheet = workbook.Sheets["Student Details"];
    const sessionSheet = workbook.Sheets["Session Details"];
    const mindlerSheet = workbook.Sheets["Mindler Assessment"];
    const masterSheet = workbook.Sheets["Master Data"];

    const students = XLSX.utils.sheet_to_json<any>(studentSheet || {});
    const sessions = XLSX.utils.sheet_to_json<any>(sessionSheet || {});
    const mindlers = XLSX.utils.sheet_to_json<any>(mindlerSheet || {});
    const masters = XLSX.utils.sheet_to_json<any>(masterSheet || {});

    let studentMap: Record<string, string> = {};

    // 🧑‍🎓 STEP 1: Insert Students
    for (const row of students) {
      if (!row["AKEB ID"]) continue;

      const akebId = String(row["AKEB ID"]).trim();
      const student = await prisma.student.upsert({
        where: { akeb_id: akebId },
        update: {},
        create: {
          akeb_id: akebId,
          full_name: String(row["Student Name"] ?? "").trim(),
          email: row["Email ID"] ? String(row["Email ID"]).trim() : null,
          contact_number: row["Contact Number"] ? String(row["Contact Number"]).trim() : null,
          school_grade: row["School Grade"] != null ? String(row["School Grade"]).trim() : null,
          school_name: row["School Name"] ? String(row["School Name"]).trim() : null,
        },
      });

      studentMap[akebId] = student.id;
    }

    // 📊 STEP 2: Update Master Data
    for (const row of masters) {
      const akebId = String(row["AKEB ID"] ?? "").trim();
      const id = studentMap[akebId];
      if (!id) continue;

      await prisma.student.update({
        where: { id },
        data: {
          council: row["Council"] ? String(row["Council"]).trim() : null,
          centre: row["Centre"] ? String(row["Centre"]).trim() : null,
        },
      });
    }

    // 📋 STEP 3: Sessions
    for (const row of sessions) {
      const akebId = String(row["AKEB ID"] ?? "").trim();
      const studentId = studentMap[akebId];
      if (!studentId) continue;

      const rawDate = row["Session Date"];
      let sessionDate: Date | null = null;
      if (rawDate) {
        // XLSX serial number or string date
        if (typeof rawDate === "number") {
          sessionDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
        } else {
          const parsed = new Date(rawDate);
          if (!isNaN(parsed.getTime())) sessionDate = parsed;
        }
      }

      await prisma.session.create({
        data: {
          student_id: studentId,
          session_date: sessionDate,
          career_choice: row["Career Choice"] ? String(row["Career Choice"]).trim() : null,
          observations: row["Consellor Observations"] ? String(row["Consellor Observations"]).trim() : null,
        },
      });
    }

    // 🧠 STEP 4: Mindler
    for (const row of mindlers) {
      const akebId = String(row["Main_ID"] ?? "").trim();
      const studentId = studentMap[akebId];
      if (!studentId) continue;

      await prisma.mindlerAssessment.upsert({
        where: { student_id: studentId },
        update: {
          mindler_id: row["Mindler ID"] ? String(row["Mindler ID"]).trim() : null,
          mindler_password: row["Mindler Password"] ? String(row["Mindler Password"]).trim() : null,
          result_summary: row["Mindler Assessment"] ? String(row["Mindler Assessment"]).trim() : null,
        },
        create: {
          student_id: studentId,
          mindler_id: row["Mindler ID"] ? String(row["Mindler ID"]).trim() : null,
          mindler_password: row["Mindler Password"] ? String(row["Mindler Password"]).trim() : null,
          result_summary: row["Mindler Assessment"] ? String(row["Mindler Assessment"]).trim() : null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      students: students.length,
      sessions: sessions.length,
      mindler: mindlers.length,
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}