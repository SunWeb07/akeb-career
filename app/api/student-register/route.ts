import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      full_name,
      email,
      password,
      contact_number,
      date_of_birth,
      school_name,
      school_grade,
      reason,
      topics,
      preferred_time,
      urgency,
      additional_notes,
    } = body;

    // Validate required fields
    if (!full_name || !email || !password || !contact_number || !school_name || !school_grade || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { email },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please use a different email or sign in." },
        { status: 400 }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Try to create user with admin API if service role is available, otherwise use signUp
    let userId: string;
    let authError: any = null;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Use admin API with service role
      const { data: authData, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm for dev
        user_metadata: {
          full_name,
        },
      });
      authError = error;
      userId = authData?.user?.id || "";
    } else {
      // Use regular signUp (will send verification email in production)
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
          },
        },
      });
      authError = error;
      userId = authData?.user?.id || "";
    }

    if (authError || !userId) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: authError?.message || "Failed to create account" },
        { status: 400 }
      );
    }

    // Generate unique AKEB ID
    const studentCount = await prisma.student.count();
    const akebId = `AKEB-${String(studentCount + 1).padStart(4, "0")}`;

    try {
      // Create Profile
      await prisma.profile.create({
        data: {
          id: userId,
          email,
          full_name,
          role: "student",
        },
      });

      console.log("✅ Profile created for:", email);

      // Create Student record
      const student = await prisma.student.create({
        data: {
          akeb_id: akebId,
          full_name,
          email,
          contact_number,
          date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
          school_name,
          school_grade,
        },
      });

      console.log("✅ Student record created:", akebId);

      // Create Session Request
      await prisma.sessionRequest.create({
        data: {
          student_id: student.id,
          type: "initial",
          reason,
          topics: topics?.join(", ") || null,
          preferred_time: preferred_time || null,
          urgency: urgency || "soon",
          additional_notes: additional_notes || null,
          status: "pending",
        },
      });

      console.log("✅ Session request created");

      return NextResponse.json({
        success: true,
        message: "Registration successful! Please check your email to verify your account.",
        student_id: student.id,
        akeb_id: akebId,
      });
    } catch (dbError: any) {
      // If database operations fail, try to clean up the auth user
      console.error("❌ Database error:", dbError);
      console.error("Error details:", dbError.message);
      
      // Attempt cleanup
      try {
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          await supabase.auth.admin.deleteUser(userId);
          console.log("🧹 Cleaned up auth user");
        }
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }

      return NextResponse.json(
        { 
          error: "Failed to complete registration. Please try again.",
          details: process.env.NODE_ENV === "development" ? dbError.message : undefined
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ Registration error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        error: error.message || "Something went wrong",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
