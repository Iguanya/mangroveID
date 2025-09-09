import { type NextRequest, NextResponse } from "next/server"
import { modelService } from "@/lib/model-service"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File
    const imageId = formData.get("imageId") as string // ID of uploaded image
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
      let speciesId = null
      const { data: existingSpecies } = await supabase
        .from("plant_species")
        .select("id")
        .eq("scientific_name", result.class)
        .single()

      if (existingSpecies) {
        speciesId = existingSpecies.id
      } else {
        // Create new species entry
        const { data: newSpecies, error: speciesError } = await supabase
          .from("plant_species")
          .insert({
            scientific_name: result.class,
            common_name: result.species_info.common_name,
            family: result.species_info.family,
            habitat: result.species_info.habitat,
            conservation_status: result.species_info.conservation_status || "Unknown",
            description: `Identified by ${result.model_used}`,
          })
          .select("id")
          .single()

        if (speciesError) {
          console.error("Failed to create species:", speciesError)
        } else {
          speciesId = newSpecies?.id
        }
      }

      const { error: dbError } = await supabase.from("plant_identifications").insert({
        user_id: user.id,
        image_id: imageId,
        species_id: speciesId,
        confidence_score: result.confidence,
        model_version: result.model_used,
        identification_method: source || "upload",
        additional_notes: `Processing time: ${result.processing_time}ms`,
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
