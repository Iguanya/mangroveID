import { NextResponse } from "next/server"
import { modelService } from "@/lib/model-service"

export async function GET() {
  try {
    const models = modelService.getAllModels()
    const stats = modelService.getModelStats()

    return NextResponse.json({
      models,
      stats,
      active_model: stats.active_model,
    })
  } catch (error) {
    console.error("Models API error:", error)
    return NextResponse.json({ error: "Failed to fetch model information" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { modelKey } = await request.json()

    if (!modelKey) {
      return NextResponse.json({ error: "Model key is required" }, { status: 400 })
    }

    const success = modelService.switchModel(modelKey)

    if (!success) {
      return NextResponse.json({ error: "Invalid model key" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      active_model: modelKey,
    })
  } catch (error) {
    console.error("Model switch API error:", error)
    return NextResponse.json({ error: "Failed to switch model" }, { status: 500 })
  }
}
