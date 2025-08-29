import { type NextRequest, NextResponse } from "next/server"
import { modelService } from "@/lib/model-service"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File
    const source = formData.get("source") as string // 'camera' or 'upload'

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get prediction from model service
    const result = await modelService.predictImage(buffer, file.name)

    // Check if result is an error
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Save to database if user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Save identification result to database
      const { error: dbError } = await supabase.from("identifications").insert({
        user_id: user.id,
        image_name: file.name,
        predicted_species: result.class,
        confidence_score: result.confidence,
        model_used: result.model_used,
        processing_time: result.processing_time,
        source: source || "upload",
        species_info: result.species_info,
      })

      if (dbError) {
        console.error("Failed to save identification:", dbError)
      }
    }

    return NextResponse.json({
      success: true,
      prediction: result,
    })
  } catch (error) {
    console.error("Identification API error:", error)
    return NextResponse.json({ error: "Failed to process image identification" }, { status: 500 })
  }
}
