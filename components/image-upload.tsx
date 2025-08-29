"use client"

import type React from "react"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Camera, X, CheckCircle } from "lucide-react"

interface ImageUploadProps {
  onClose: () => void
  onSuccess: () => void
}

export function ImageUpload({ onClose, onSuccess }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [userLabel, setUserLabel] = useState("")
  const [plantPart, setPlantPart] = useState("")
  const [locationName, setLocationName] = useState("")
  const [notes, setNotes] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [useCamera, setUseCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const supabase = createClient()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(selectedFile)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      })
      setStream(mediaStream)
      setUseCamera(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Could not access camera. Please check permissions.")
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const capturedFile = new File([blob], `plant-${Date.now()}.jpg`, { type: "image/jpeg" })
              setFile(capturedFile)
              setPreview(canvas.toDataURL())
              stopCamera()
            }
          },
          "image/jpeg",
          0.8,
        )
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setUseCamera(false)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("plant-images")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("plant-images").getPublicUrl(fileName)

      // Save to database
      const { error: dbError } = await supabase.from("uploaded_images").insert({
        user_id: user.id,
        filename: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        user_label: userLabel || null,
        plant_part: plantPart || null,
        location_name: locationName || null,
        notes: notes || null,
      })

      if (dbError) throw dbError

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-emerald-800">Upload Plant Image</CardTitle>
              <CardDescription>Help improve our AI model by uploading labeled plant images</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera/Upload Selection */}
          {!file && !useCamera && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-2 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-emerald-600" />
                <span>Choose File</span>
              </Button>
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-2 border-emerald-200 hover:bg-emerald-50 bg-transparent"
                onClick={startCamera}
              >
                <Camera className="h-8 w-8 text-emerald-600" />
                <span>Use Camera</span>
              </Button>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

          {/* Camera View */}
          {useCamera && (
            <div className="space-y-4">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
              <div className="flex gap-2 justify-center">
                <Button onClick={capturePhoto} className="bg-emerald-600 hover:bg-emerald-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Preview */}
          {preview && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full rounded-lg max-h-64 object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 bg-white bg-opacity-80"
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userLabel">Plant Label *</Label>
                  <Input
                    id="userLabel"
                    placeholder="e.g., Red Mangrove"
                    value={userLabel}
                    onChange={(e) => setUserLabel(e.target.value)}
                    className="border-emerald-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plantPart">Plant Part</Label>
                  <Select value={plantPart} onValueChange={setPlantPart}>
                    <SelectTrigger className="border-emerald-200">
                      <SelectValue placeholder="Select part" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leaf">Leaf</SelectItem>
                      <SelectItem value="stem">Stem</SelectItem>
                      <SelectItem value="branch">Branch</SelectItem>
                      <SelectItem value="root">Root</SelectItem>
                      <SelectItem value="flower">Flower</SelectItem>
                      <SelectItem value="fruit">Fruit</SelectItem>
                      <SelectItem value="whole_plant">Whole Plant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationName">Location</Label>
                <Input
                  id="locationName"
                  placeholder="e.g., Everglades National Park"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="border-emerald-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional observations about this plant..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-emerald-200"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onClose} disabled={isUploading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !userLabel.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
