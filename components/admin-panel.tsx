"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Settings, Camera } from "lucide-react"
import { ModelSelector } from "./model-selector"

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [allImages, setAllImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadLabel, setUploadLabel] = useState("")
  const [uploadDescription, setUploadDescription] = useState("")
  const [uploadPlantType, setUploadPlantType] = useState("")
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const plantTypes = [
    "Rhizophora mangle",
    "Avicennia germinans",
    "Laguncularia racemosa",
    "Conocarpus erectus",
    "Spartina alterniflora",
    "Salicornia virginica",
    "Batis maritima",
    "Sesuvium portulacastrum",
    "Other",
  ]

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      // Fetch all uploaded images
      const { data: imagesData, error: imagesError } = await supabase
        .from("uploaded_images")
        .select(`
          *,
          profiles:user_id (display_name, email)
        `)
        .order("created_at", { ascending: false })

      setUsers(usersData || [])
      setAllImages(imagesData || [])
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminUpload = async () => {
    if (!uploadFile || !uploadLabel || !uploadPlantType) {
      alert("Please fill in all required fields")
      return
    }

    setUploading(true)
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      console.log("[v0] Starting admin upload:", {
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        plantType: uploadPlantType,
        userId: user.id,
      })

      // Upload file to storage
      const fileExt = uploadFile.name.split(".").pop()
      const fileName = `admin_${Date.now()}.${fileExt}`
      const filePath = `admin-uploads/${fileName}`

      console.log("[v0] Uploading to storage path:", filePath)

      const { error: uploadError } = await supabase.storage.from("plant-images").upload(filePath, uploadFile)

      if (uploadError) {
        console.error("[v0] Storage upload error:", uploadError)
        throw uploadError
      }

      console.log("[v0] Storage upload successful, saving to database")

      const { error: dbError } = await supabase.from("uploaded_images").insert({
        user_id: user.id,
        filename: uploadFile.name,
        file_url: filePath, // Changed from file_path to file_url
        file_size: uploadFile.size,
        mime_type: uploadFile.type,
        user_label: uploadPlantType, // Plant type goes in user_label
        notes: uploadDescription, // Changed from description to notes
        is_verified: true, // Admin uploads are pre-verified
      })

      if (dbError) {
        console.error("[v0] Database insert error:", dbError)
        throw dbError
      }

      console.log("[v0] Upload completed successfully")

      // Reset form
      setUploadFile(null)
      setUploadLabel("")
      setUploadDescription("")
      setUploadPlantType("")

      // Refresh data
      await fetchAdminData()

      alert("Image uploaded successfully!")
    } catch (error) {
      console.error("[v0] Upload error details:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Upload failed: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading admin panel...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-forest-900">Admin Panel</h1>
        <Badge variant="secondary" className="bg-forest-100 text-forest-800">
          Admin Access
        </Badge>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === "overview" ? "default" : "ghost"}
          onClick={() => setActiveTab("overview")}
          className="flex-1"
        >
          Overview
        </Button>
        <Button
          variant={activeTab === "upload" ? "default" : "ghost"}
          onClick={() => setActiveTab("upload")}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Images
        </Button>
        <Button
          variant={activeTab === "models" ? "default" : "ghost"}
          onClick={() => setActiveTab("models")}
          className="flex-1"
        >
          <Settings className="h-4 w-4 mr-2" />
          Model Settings
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
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
                        {image.is_admin_upload && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Admin Upload
                          </Badge>
                        )}
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
        </>
      )}

      {activeTab === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-forest-800">
              <Camera className="h-5 w-5" />
              Upload Training Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-upload">Select Image</Label>
                <Input
                  id="admin-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plant-type">Plant Type</Label>
                <Select value={uploadPlantType} onValueChange={setUploadPlantType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plant type" />
                  </SelectTrigger>
                  <SelectContent>
                    {plantTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">Image Label</Label>
              <Input
                id="label"
                value={uploadLabel}
                onChange={(e) => setUploadLabel(e.target.value)}
                placeholder="Descriptive label for this image"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Additional notes about this image"
                rows={3}
              />
            </div>

            <Button
              onClick={handleAdminUpload}
              disabled={uploading || !uploadFile || !uploadLabel || !uploadPlantType}
              className="w-full"
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "models" && <ModelSelector />}
    </div>
  )
}
