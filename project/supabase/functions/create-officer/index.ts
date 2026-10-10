import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateOfficerPayload {
  action?: "create" | "reset_password" | "revoke";
  fullName?: string;
  employeeId?: string;
  email?: string;
  department?: string;
  designation?: string;
  temporaryPassword?: string;
  officerId?: string;
  newPassword?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server misconfiguration: missing Supabase environment variables" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Authenticate caller with user JWT
    const userClient = createClient(supabaseUrl, anonKey || "", {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session. Please log in as Admin." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerUser = userData.user;

    // 2. Authorize caller - strictly verify Admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleRow, error: roleError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerUser.id)
      .maybeSingle();

    if (roleError || !roleRow || roleRow.role !== "admin") {
      // Log unauthorized attempt in audit log
      await adminClient.from("admin_audit_logs").insert({
        actor_id: callerUser.id,
        actor_name: callerUser.email || "Unknown Caller",
        actor_role: roleRow?.role || "unauthorized",
        action: "unauthorized_admin_attempt",
        target_id: "officer_management",
        detail: "Unauthorized attempt to invoke Admin Officer Management functions",
        metadata: { ip: req.headers.get("x-forwarded-for") || "unknown" }
      });

      return new Response(
        JSON.stringify({ error: "Access Denied: Only authorized Administrators (Nahid Shams) can perform this action." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: CreateOfficerPayload = await req.json();
    const action = body.action || "create";

    // ── ACTION: RESET PASSWORD ──
    if (action === "reset_password") {
      const { officerId, newPassword } = body;
      if (!officerId || !newPassword) {
        return new Response(
          JSON.stringify({ error: "Missing officerId or newPassword" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify officer exists
      const { data: officerRec, error: fetchErr } = await adminClient
        .from("officers")
        .select("id, full_name, employee_id, email")
        .eq("id", officerId)
        .single();

      if (fetchErr || !officerRec) {
        return new Response(
          JSON.stringify({ error: "Officer record not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update password using Supabase Admin Auth API
      const { error: pwdErr } = await adminClient.auth.admin.updateUserById(officerId, {
        password: newPassword,
      });

      if (pwdErr) {
        return new Response(
          JSON.stringify({ error: `Failed to reset password: ${pwdErr.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Set must_change_password to true
      await adminClient
        .from("officers")
        .update({ must_change_password: true, updated_at: new Date().toISOString() })
        .eq("id", officerId);

      // Audit log (never log passwords!)
      await adminClient.from("admin_audit_logs").insert({
        actor_id: callerUser.id,
        actor_name: "Nahid Shams",
        actor_role: "admin",
        action: "officer_password_reset",
        target_id: officerRec.employee_id,
        detail: `Temporary password reset initiated for Officer ${officerRec.full_name} (${officerRec.employee_id})`,
        metadata: { officer_id: officerId, must_change_password: true }
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Temporary password reset successfully for Officer ${officerRec.full_name}. Password change will be required on next login.`
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── ACTION: REVOKE ACCESS ──
    if (action === "revoke") {
      const { officerId } = body;
      if (!officerId) {
        return new Response(
          JSON.stringify({ error: "Missing officerId" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: officerRec } = await adminClient
        .from("officers")
        .select("full_name, employee_id")
        .eq("id", officerId)
        .single();

      await adminClient
        .from("officers")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", officerId);

      await adminClient
        .from("user_roles")
        .update({ role: "citizen", updated_at: new Date().toISOString() })
        .eq("user_id", officerId);

      // Invalidate active session tokens in auth
      await adminClient.auth.admin.signOut(officerId);

      await adminClient.from("admin_audit_logs").insert({
        actor_id: callerUser.id,
        actor_name: "Nahid Shams",
        actor_role: "admin",
        action: "officer_access_revoked",
        target_id: officerRec?.employee_id || officerId,
        detail: `Officer credentials and authorization revoked for ${officerRec?.full_name || officerId} by Administrator Nahid Shams`,
        metadata: { officer_id: officerId }
      });

      return new Response(
        JSON.stringify({ success: true, message: "Officer access revoked and active sessions terminated." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── ACTION: CREATE OFFICER ──
    const {
      fullName,
      employeeId,
      email,
      department,
      designation,
      temporaryPassword
    } = body;

    // Validate required fields
    if (!fullName?.trim() || !employeeId?.trim() || !email?.trim() || !department?.trim() || !designation?.trim()) {
      return new Response(
        JSON.stringify({ error: "All officer details (Full Name, Employee ID, Email, Department, Designation) are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate employee ID
    const { data: existingEmp } = await adminClient
      .from("officers")
      .select("id")
      .eq("employee_id", employeeId.trim())
      .maybeSingle();

    if (existingEmp) {
      return new Response(
        JSON.stringify({ error: `An officer with Employee ID "${employeeId}" already exists.` }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate email
    const { data: existingEmail } = await adminClient
      .from("officers")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (existingEmail) {
      return new Response(
        JSON.stringify({ error: `An officer with email "${email}" already exists.` }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Password generation or validation
    const tempPasswordToUse = temporaryPassword && temporaryPassword.length >= 8
      ? temporaryPassword
      : `GovOfficer@${Math.random().toString(36).slice(-6)}!`;

    // 1. Create auth user via Supabase Admin Auth API
    const { data: newAuthData, error: createAuthError } = await adminClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: tempPasswordToUse,
      email_confirm: true,
      user_metadata: {
        full_name: fullName.trim(),
        employee_id: employeeId.trim(),
        department: department.trim(),
        designation: designation.trim(),
        role: "officer"
      }
    });

    if (createAuthError || !newAuthData?.user) {
      return new Response(
        JSON.stringify({ error: `Failed to create auth user: ${createAuthError?.message || "Unknown error"}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUserId = newAuthData.user.id;

    // 2. Assign role 'officer' in user_roles table
    const { error: roleAssignError } = await adminClient.from("user_roles").upsert({
      user_id: newUserId,
      role: "officer",
      assigned_by: callerUser.id,
      updated_at: new Date().toISOString()
    });

    if (roleAssignError) {
      // Rollback auth user
      await adminClient.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({ error: `Failed to assign officer role: ${roleAssignError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Create record in public.officers table
    const { error: officerInsertError } = await adminClient.from("officers").insert({
      id: newUserId,
      employee_id: employeeId.trim(),
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      designation: designation.trim(),
      is_active: true,
      must_change_password: true,
      created_by: callerUser.id
    });

    if (officerInsertError) {
      // Rollback
      await adminClient.from("user_roles").delete().eq("user_id", newUserId);
      await adminClient.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({ error: `Failed to create officer profile: ${officerInsertError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Record in immutable audit log (Nahid Shams)
    await adminClient.from("admin_audit_logs").insert({
      actor_id: callerUser.id,
      actor_name: "Nahid Shams",
      actor_role: "admin",
      action: "officer_created",
      target_id: employeeId.trim(),
      detail: `Officer account created for ${fullName.trim()} (${employeeId.trim()}), Department: ${department.trim()}, Designation: ${designation.trim()}`,
      metadata: {
        employee_id: employeeId.trim(),
        department: department.trim(),
        designation: designation.trim(),
        email: email.trim().toLowerCase()
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        officer: {
          id: newUserId,
          employee_id: employeeId.trim(),
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          department: department.trim(),
          designation: designation.trim(),
          is_active: true,
          must_change_password: true
        },
        // We return the temporary password once so the Admin can securely copy it or share invite
        temporaryPasswordNotice: "Temporary password generated. Officer must change password on initial login."
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
