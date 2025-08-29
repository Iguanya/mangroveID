"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PlantScanner from "@/components/PlantScanner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, ImageIcon, Leaf, LogOut, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { ImageUpload } from "./image-upload"

interface UploadedImage {
  id: string
  filename: string
  file_url: string
  user_label: string | null
  plant_part: string | null
  location_name: string | null
  created_at: string
  identification_count: number
}

interface Identification {
  id: string
  image_filename: string
  image_url: string
  scientific_name: string | null
  common_name: string | null
  confidence_score: number | null
  identification_method: string | null
  created_at: string
  is_correct: boolean | null
}

interface DashboardContentProps {
  user: SupabaseUser
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [uploads, setUploads] = useState<UploadedImage[]>([])
  const [identifications, setIdentifications] = useState<Identification[]>([])
  const [loading, setLoading] = useState(true)
  const [showScanner, setShowScanner] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch recent uploads
      const { data: uploadsData, error: uploadsError } = await supabase.rpc("get_user_recent_uploads", {
        user_uuid: user.id,
        limit_count: 10,
      })

      if (uploadsError) throw uploadsError
      setUploads(uploadsData || [])

      // Fetch recent identifications
      const { data: identificationsData, error: identificationsError } = await supabase.rpc(
        "get_user_identifications",
        { user_uuid: user.id, limit_count: 10 },
      )

      if (identificationsError) throw identificationsError
      setIdentifications(identificationsData || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }

  const handleUploadSuccess = () => {
    fetchDashboardData() // Refresh data after successful upload
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPlantPartColor = (part: string | null) => {
    const colors: Record<string, string> = {
      leaf: "bg-green-100 text-green-800",
      stem: "bg-amber-100 text-amber-800",
      branch: "bg-orange-100 text-orange-800",
      root: "bg-stone-100 text-stone-800",
      flower: "bg-pink-100 text-pink-800",
      fruit: "bg-purple-100 text-purple-800",
      whole_plant: "bg-emerald-100 text-emerald-800",
    }
    return colors[part || ""] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-emerald-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Leaf className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-emerald-800">MangroveID</h1>
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
                <span>{user.user_metadata?.display_name || user.email}</span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Scan Plant */}
          <Card onClick={() => setShowScanner(true)} className="cursor-pointer hover:shadow-lg transition">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Camera className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-emerald-800">Scan Plant</CardTitle>
                  <CardDescription>
                    Use your camera to identify plants in real-time
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Upload Image */}
          <Card
            className="border-emerald-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setShowUpload(true)} // 👈 opens upload modal
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Upload className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-emerald-800">Upload Image</CardTitle>
                  <CardDescription>Upload photos to help train our AI model</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>


        {/* Dashboard Tabs */}
        <Tabs defaultValue="uploads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-emerald-200">
            <TabsTrigger
              value="uploads"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              My Uploads ({uploads.length})
            </TabsTrigger>
            <TabsTrigger
              value="identifications"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              Identifications ({identifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uploads" className="space-y-4">
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800">
                  <ImageIcon className="h-5 w-5" />
                  Recent Uploads
                </CardTitle>
                <CardDescription>
                  Images you&apos;ve uploaded to help train our plant identification model
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploads.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No uploads yet. Start by uploading your first plant image!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="border border-emerald-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                        {upload.file_url ? (
                          <img
                            src={upload.file_url}
                            alt={upload.user_label || upload.filename}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-emerald-800 truncate">
                            {upload.user_label || upload.filename}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {upload.plant_part && (
                              <Badge variant="secondary" className={getPlantPartColor(upload.plant_part)}>
                                {upload.plant_part.replace("_", " ")}
                              </Badge>
                            )}
                            {upload.identification_count > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {upload.identification_count} ID{upload.identification_count !== 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{formatDate(upload.created_at)}</p>
                          {upload.location_name && (
                            <p className="text-xs text-emerald-600">📍 {upload.location_name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="identifications" className="space-y-4">
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800">
                  <Leaf className="h-5 w-5" />
                  Plant Identifications
                </CardTitle>
                <CardDescription>Results from our AI model and expert reviews</CardDescription>
              </CardHeader>
              <CardContent>
                {identifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Leaf className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No identifications yet. Upload or scan a plant to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {identifications.map((identification) => (
                      <div
                        key={identification.id}
                        className="border border-emerald-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-emerald-800">
                                  {identification.common_name || identification.scientific_name || "Unknown Species"}
                                </h4>
                                {identification.scientific_name && identification.common_name && (
                                  <p className="text-sm text-gray-600 italic">{identification.scientific_name}</p>
                                )}
                              </div>
                              {identification.confidence_score && (
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(identification.confidence_score * 100)}% confident
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{formatDate(identification.created_at)}</span>
                              {identification.identification_method && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">
                                    {identification.identification_method.replace("_", " ")}
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-xs text-gray-600">From: {identification.image_filename}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upload Modal */}
        {showScanner && <PlantScanner onClose={() => setShowScanner(false)} />}
        {showUpload && <ImageUpload onClose={() => setShowUpload(false)} onSuccess={handleUploadSuccess} />}
      </main>
    </div>
  )
}
