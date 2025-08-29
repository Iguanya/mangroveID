"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [allImages, setAllImages] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  console.log("[v0] AdminPanel component is rendering")

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      console.log("[v0] Fetching admin data...")

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
      console.log("[v0] Users data:", usersData)
      console.log("[v0] Users error:", usersError)

      // Fetch all uploaded images
      const { data: imagesData, error: imagesError } = await supabase
        .from("uploaded_images")
        .select(`
          *,
          profiles:user_id (display_name, email)
        `)
        .order("created_at", { ascending: false })

      console.log("[v0] Images data:", imagesData)
      console.log("[v0] Images error:", imagesError)

      setUsers(usersData || [])
      setAllImages(imagesData || [])
    } catch (error) {
      console.error("[v0] Error fetching admin data:", error)
    } finally {
      setLoading(false)
      console.log("[v0] Admin data loading complete")
    }
  }

  if (loading) {
    console.log("[v0] AdminPanel showing loading state")
    return <div className="p-6">Loading admin panel...</div>
  }

  console.log("[v0] AdminPanel rendering main content")
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-forest-900">Admin Panel</h1>
        <Badge variant="secondary" className="bg-forest-100 text-forest-800">
          Admin Access
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-forest-800">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{user.display_name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-forest-800">Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allImages.slice(0, 5).map((image: any) => (
                <div key={image.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{image.filename}</p>
                    <p className="text-sm text-gray-600">by {image.profiles?.display_name || "Unknown"}</p>
                  </div>
                  <Badge variant="outline">{image.plant_type || "Unlabeled"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-forest-800">Platform Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-forest-600">{users.length}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-forest-600">{allImages.length}</p>
              <p className="text-sm text-gray-600">Images Uploaded</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-forest-600">
                {allImages.filter((img: any) => img.plant_type).length}
              </p>
              <p className="text-sm text-gray-600">Labeled Images</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-forest-600">
                {users.filter((user: any) => user.role === "admin").length}
              </p>
              <p className="text-sm text-gray-600">Admin Users</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
