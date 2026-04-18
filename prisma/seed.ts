/**
 * Seed script — populates Supabase Auth users, Profiles, and Students.
 *
 * Run with:  npm run db:seed
 *
 * Dev login credentials (local only):
 *   admin@akeb.dev        / devpass123
 *   counsellor@akeb.dev   / devpass123
 *   institution@akeb.dev  / devpass123
 *   fmp@akeb.dev          / devpass123
 *   student@akeb.dev      / devpass123
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  // ── Supabase Auth users (inserted directly into auth schema) ─────────────
  // Uses pgcrypto's crypt() — same function Supabase uses for passwords
  await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  const authUsers = [
    { id: "00000000-0000-0000-0000-000000000001", email: "admin@akeb.dev" },
    { id: "00000000-0000-0000-0000-000000000002", email: "counsellor@akeb.dev" },
    { id: "00000000-0000-0000-0000-000000000003", email: "institution@akeb.dev" },
    { id: "00000000-0000-0000-0000-000000000004", email: "student@akeb.dev" },
  ];

  for (const u of authUsers) {
    // Delete by email first so re-seeding is always clean
    await prisma.$executeRaw`DELETE FROM auth.identities WHERE user_id = ${u.id}::uuid`;
    await prisma.$executeRaw`DELETE FROM auth.users WHERE email = ${u.email}`;

    await prisma.$executeRaw`
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        ${u.id}::uuid,
        'authenticated',
        'authenticated',
        ${u.email},
        crypt('devpass123', gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        false,
        '', '', '', ''
      )
    `;

    // GoTrue requires an identity row for email/password login to work
    await prisma.$executeRaw`
      INSERT INTO auth.identities (
        id, provider_id, user_id, provider, identity_data, created_at, updated_at, last_sign_in_at
      ) VALUES (
        ${u.id}::uuid,
        ${u.email},
        ${u.id}::uuid,
        'email',
        ('{"sub":"' || ${u.id} || '","email":"' || ${u.email} || '"}')::jsonb,
        now(), now(), now()
      )
    `;
  }

  console.log("✅  Auth users created — password: devpass123");

  // ── Profiles ──────────────────────────────────────────────────────────────
  const profiles = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      full_name: "Dev Admin",
      email: "admin@akeb.dev",
      role: "admin",
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      full_name: "Sarah Counsellor",
      email: "counsellor@akeb.dev",
      role: "counsellor",
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      full_name: "Greenwood High",
      email: "institution@akeb.dev",
      role: "institution",
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      full_name: "Aisha Patel",
      email: "student@akeb.dev",
      role: "student",
    },
  ];

  for (const profile of profiles) {
    await prisma.profile.upsert({
      where: { email: profile.email },
      update: { full_name: profile.full_name, role: profile.role },
      create: profile,
    });
  }

  console.log("✅  Profiles seeded:", profiles.map((p) => p.email).join(", "));

  // ── Institutions ─────────────────────────────────────────────────────────
  const institution = await prisma.institution.upsert({
    where: { id: "00000000-0000-0000-0001-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0001-000000000001",
      name: "Greenwood High School",
      type: "secondary",
      council: "Western Cape",
      centre: "Cape Town Central",
    },
  });

  console.log("✅  Institution seeded:", institution.name);

  // ── Students ───────────────────────────────────────────────────
  const students = [
    {
      id: "00000000-0000-0000-0002-000000000001",
      akeb_id: "AKEB-0001",
      full_name: "Aisha Patel",
      email: "student@akeb.dev", // Match the auth user
      contact_number: "071 123 4567",
      school_grade: "11",
      school_name: "Greenwood High School",
    },
    {
      id: "00000000-0000-0000-0002-000000000002",
      akeb_id: "AKEB-0002",
      full_name: "Luca Mokoena",
      email: "luca@student.dev",
      contact_number: "072 987 6543",
      school_grade: "12",
      school_name: "Greenwood High School",
    },
    {
      id: "00000000-0000-0000-0002-000000000003",
      akeb_id: "AKEB-0003",
      full_name: "Zara Williams",
      email: "zara@student.dev",
      contact_number: "073 456 7890",
      school_grade: "10",
      school_name: "Greenwood High School",
    },
  ];

  for (const student of students) {
    await prisma.student.upsert({
      where: { akeb_id: student.akeb_id },
      update: {
        full_name: student.full_name,
        email: student.email,
        contact_number: student.contact_number,
        school_grade: student.school_grade,
        school_name: student.school_name,
      },
      create: student,
    });

    // Link each student to the test institution
    await prisma.studentInstitution.upsert({
      where: {
        student_id_institution_id: {
          student_id: student.id,
          institution_id: institution.id,
        },
      },
      update: {},
      create: {
        student_id: student.id,
        institution_id: institution.id,
      },
    });
  }

  console.log("✅  Students seeded:", students.map((s) => s.akeb_id).join(", "));

  // ── Sessions & Tasks for Aisha Patel (student@akeb.dev) ─────────────────
  const aishaStudent = students[0]; // AKEB-0001
  const counsellor = profiles[1]; // Sarah Counsellor

  // Completed session
  const session1 = await prisma.session.upsert({
    where: { id: "00000000-0000-0000-0003-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0003-000000000001",
      student_id: aishaStudent.id,
      counsellor_id: counsellor.id,
      session_date: new Date("2026-03-15T10:00:00"),
      status: "completed",
      career_journey_stage: "Exploration",
      career_choice: "Biomedical Engineering, Computer Science, Medicine",
      emerging_interest: "Technology in Healthcare",
      observations: "Aisha showed strong interest in Science and Technology. Discussed engineering and medical career paths. She is particularly interested in Biomedical Engineering.",
      session_details: "Conducted initial assessment. Student completed aptitude tests showing strong analytical skills. Discussed academic requirements for engineering programs.",
      student_tasks: "Research universities, watch career videos, prepare questions",
      mindler_needed: false,
      followup_required: true,
      concluded: true,
    },
  });

  // Upcoming session
  const session2 = await prisma.session.upsert({
    where: { id: "00000000-0000-0000-0003-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0003-000000000002",
      student_id: aishaStudent.id,
      counsellor_id: counsellor.id,
      session_date: new Date("2026-04-20T14:00:00"),
      status: "scheduled",
      career_journey_stage: "Decision Making",
      followup_required: true,
      concluded: false,
    },
  });

  console.log("✅  Sessions seeded for Aisha Patel");

  // Tasks from completed session
  await prisma.task.upsert({
    where: { id: "00000000-0000-0000-0004-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0004-000000000001",
      student_id: aishaStudent.id,
      session_id: session1.id,
      assigned_to: aishaStudent.id,
      title: "Research 3 universities offering Biomedical Engineering",
      type: "research",
      status: "done",
    },
  });

  await prisma.task.upsert({
    where: { id: "00000000-0000-0000-0004-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0004-000000000002",
      student_id: aishaStudent.id,
      session_id: session1.id,
      assigned_to: aishaStudent.id,
      title: "Complete Mindler Career Assessment",
      type: "assessment",
      status: "done",
    },
  });

  // Active tasks
  await prisma.task.upsert({
    where: { id: "00000000-0000-0000-0004-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0004-000000000003",
      student_id: aishaStudent.id,
      session_id: session1.id,
      assigned_to: aishaStudent.id,
      title: "Watch documentary on Biomedical Engineering careers",
      type: "research",
      status: "in_progress",
    },
  });

  await prisma.task.upsert({
    where: { id: "00000000-0000-0000-0004-000000000004" },
    update: {},
    create: {
      id: "00000000-0000-0000-0004-000000000004",
      student_id: aishaStudent.id,
      session_id: session1.id,
      assigned_to: aishaStudent.id,
      title: "Interview someone working in healthcare technology",
      type: "networking",
      status: "pending",
    },
  });

  await prisma.task.upsert({
    where: { id: "00000000-0000-0000-0004-000000000005" },
    update: {},
    create: {
      id: "00000000-0000-0000-0004-000000000005",
      student_id: aishaStudent.id,
      session_id: session1.id,
      assigned_to: aishaStudent.id,
      title: "Prepare questions for next counselling session",
      type: "preparation",
      status: "pending",
    },
  });

  console.log("✅  Tasks seeded for Aisha Patel");
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
