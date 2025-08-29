import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardContent } from "@/components/dashboard-content"
import AdminPanel from "@/components/admin-panel"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle()

  let userRole = profile?.role
  if (!profile && !profileError) {
    // Profile doesn't exist, create one
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        email: data.user.email,
        role: "user",
      })
      .select("role")
      .single()

    userRole = newProfile?.role || "user"
  }

  if (!userRole) {
    userRole = "user"
  }

  if (userRole === "admin") {
    return <AdminPanel />
  }

  return <DashboardContent user={data.user} />
}
