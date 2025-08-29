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
import { Upload, Settings, Camera, LogOut, Leaf, RefreshCw } from "lucide-react"
import { ModelSelector } from "./model-selector"
import { useRouter } from "next/navigation"

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
  const [refreshing, setRefreshing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

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
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

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

      if (imagesError) throw imagesError

      // Add public URLs
      const imagesWithUrls =
        imagesData?.map((img) => {
          const { data } = supabase.storage.from("plant-images").getPublicUrl(img.file_url)
          return { ...img, public_url: data.publicUrl }
        }) || []

      setUsers(usersData || [])
      setAllImages(imagesWithUrls)
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchAdminData()
    setRefreshing(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleAdminUpload = async () => {
  if (!uploadFile || !uploadLabel || !uploadPlantType) {
    alert("Please fill in all required fields")
    return
  }

  setUploading(true)
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const formData = new FormData()
    formData.append("file", uploadFile)
    formData.append("userId", user.id)
    formData.append("plantType", uploadPlantType)
    formData.append("description", uploadDescription)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) throw new Error("Upload failed")

    const result = await res.json()
    console.log("Upload success:", result)

    // Save metadata in Supabase DB (optional, if still needed)
    const { error: dbError } = await supabase.from("uploaded_images").insert({
      user_id: user.id,
      filename: uploadFile.name,
      file_url: result.fileUrl, // now points to /uploads/
      file_size: uploadFile.size,
      mime_type: uploadFile.type,
      user_label: uploadPlantType,
      notes: uploadDescription,
      is_verified: true,
    })

    if (dbError) throw dbError

    setUploadFile(null)
    setUploadLabel("")
    setUploadDescription("")
    setUploadPlantType("")

    await fetchAdminData()
    alert("Image uploaded successfully!")
  } catch (error) {
    console.error("Upload error details:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    alert(`Upload failed: ${errorMessage}`)
  } finally {
    setUploading(false)
  }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <header className="bg-white border-b border-emerald-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Leaf className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-emerald-800">MangroveID</h1>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 ml-2">
                Admin
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshData}
                disabled={refreshing}
                className="text-emerald-700 hover:bg-emerald-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <span>{currentUser?.user_metadata?.display_name || currentUser?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex space-x-1 bg-white p-1 rounded-lg border border-emerald-200">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              onClick={() => setActiveTab("overview")}
              className="flex-1 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Overview
            </Button>
            <Button
              variant={activeTab === "upload" ? "default" : "ghost"}
              onClick={() => setActiveTab("upload")}
              className="flex-1 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
            <Button
              variant={activeTab === "models" ? "default" : "ghost"}
              onClick={() => setActiveTab("models")}
              className="flex-1 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
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
                        <div
                          key={image.id}
                          className="flex items-center justify-between p-3 border rounded-lg gap-4"
                        >
                          {/* Thumbnail */}
                          <div className="flex-shrink-0">
                            <img
                              src={image.url || image.file_url} // adjust field name depending on how you store it
                              alt={image.filename}
                              className="w-16 h-16 object-cover rounded-md border"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <p className="font-medium">{image.filename}</p>
                            <p className="text-sm text-gray-600">
                              by {image.profiles?.display_name || "Unknown"}
                            </p>
                            {image.is_admin_upload && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Admin Upload
                              </Badge>
                            )}
                          </div>

                          {/* Plant type */}
                          <Badge variant="outline">
                            {image.plant_type || "Unlabeled"}
                          </Badge>
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
      </main>
    </div>
  )
}
