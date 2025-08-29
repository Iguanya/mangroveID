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

  console.log("[v0] User ID:", data.user.id)
  console.log("[v0] User email:", data.user.email)

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single()

  console.log("[v0] Profile data:", profile)
  console.log("[v0] Profile error:", profileError)
  console.log("[v0] User role:", profile?.role)

  if (profile?.role === "admin") {
    console.log("[v0] Rendering AdminPanel")
    return <AdminPanel />
  }

  console.log("[v0] Rendering DashboardContent")
  return <DashboardContent user={data.user} />
}
