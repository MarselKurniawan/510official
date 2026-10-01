import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAppAuth } from "@/integrations/supabase/app-auth-middleware";

export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireAppAuth])
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(["admin", "editor", "user"]).default("admin"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleErr) throw new Error(roleErr.message);
    if (!isAdmin) throw new Error("Forbidden");

    const { createAppAdminClient } = await import("@/integrations/supabase/app-admin.server");
    const supabaseAdmin = createAppAdminClient();

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    const uid = created.user?.id;
    if (!uid) throw new Error("User creation failed");

    // Overwrite/insert role (trigger inserts default 'user' for non-first users)
    await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: uid, role: data.role });
    if (rErr) throw new Error(rErr.message);

    return { id: uid, email: data.email, role: data.role };
  });

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireAppAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { createAppAdminClient } = await import("@/integrations/supabase/app-admin.server");
    const supabaseAdmin = createAppAdminClient();
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
    if (error) throw new Error(error.message);

    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));

    return users.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      role: roleMap.get(u.id) ?? "user",
    }));
  });

export const deleteAdminUser = createServerFn({ method: "POST" })
  .middleware([requireAppAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    if (data.id === context.userId) throw new Error("Cannot delete yourself");

    const { createAppAdminClient } = await import("@/integrations/supabase/app-admin.server");
    const supabaseAdmin = createAppAdminClient();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
