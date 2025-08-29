import type { ModelConfig, ModelDefinition, PredictionResult, ModelError } from "./types/model"
import fs from "fs"
import path from "path"

class ModelService {
  private config: ModelConfig
  private loadedModels: Map<string, any> = new Map()

  constructor() {
    this.loadConfig()
  }

  private loadConfig(): void {
    try {
      const configPath = path.join(process.cwd(), "model-config.json")
      const configData = fs.readFileSync(configPath, "utf-8")
      this.config = JSON.parse(configData)

      if (this.config.logging.level === "debug") {
        console.log("[ModelService] Configuration loaded:", this.config)
      }
    } catch (error) {
      console.error("[ModelService] Failed to load model configuration:", error)
      throw new Error("Model configuration not found or invalid")
    }
  }

  public getActiveModel(): ModelDefinition {
    const activeModelKey = this.config.activeModel
    const model = this.config.models[activeModelKey]

    if (!model) {
      console.warn(`[ModelService] Active model '${activeModelKey}' not found, using fallback`)
      return this.config.models[this.config.fallback_model]
    }

    return model
  }

  public getAllModels(): Record<string, ModelDefinition> {
    return this.config.models
  }

  public switchModel(modelKey: string): boolean {
    if (!this.config.models[modelKey]) {
      console.error(`[ModelService] Model '${modelKey}' not found`)
      return false
    }

    this.config.activeModel = modelKey

    // In a real implementation, you would save this back to the config file
    // For now, it's just in memory

    if (this.config.logging.level === "info") {
      console.log(`[ModelService] Switched to model: ${modelKey}`)
    }

    return true
  }

  public async predictImage(imageBuffer: Buffer, imageName: string): Promise<PredictionResult | ModelError> {
    const startTime = Date.now()
    const activeModel = this.getActiveModel()

    try {
      // Validate image format
      const imageFormat = this.getImageFormat(imageName)
      if (!activeModel.supported_formats.includes(imageFormat)) {
        throw new Error(`Unsupported image format: ${imageFormat}`)
      }

      // Validate image size
      if (imageBuffer.length > activeModel.max_image_size * 1024) {
        throw new Error(`Image too large. Max size: ${activeModel.max_image_size}KB`)
      }

      // This is where you would integrate with your actual model
      // For now, we'll simulate a prediction
      const prediction = await this.runModelPrediction(activeModel, imageBuffer)

      const processingTime = Date.now() - startTime

      const result: PredictionResult = {
        class: prediction.class,
        confidence: prediction.confidence,
        species_info: this.getSpeciesInfo(prediction.class),
        processing_time: processingTime,
        model_used: this.config.activeModel,
        timestamp: new Date().toISOString(),
      }

      if (this.config.logging.log_predictions) {
        console.log("[ModelService] Prediction result:", result)
      }

      return result
    } catch (error) {
      const modelError: ModelError = {
        error: error instanceof Error ? error.message : "Unknown error",
        model: this.config.activeModel,
        timestamp: new Date().toISOString(),
        image_info: {
          size: imageBuffer.length,
          format: this.getImageFormat(imageName),
          dimensions: [0, 0], // Would be extracted from actual image
        },
      }

      if (this.config.logging.log_errors) {
        console.error("[ModelService] Prediction error:", modelError)
      }

      return modelError
    }
  }

  private async runModelPrediction(
    model: ModelDefinition,
    imageBuffer: Buffer,
  ): Promise<{ class: string; confidence: number }> {
    // This is where you would integrate with your actual OpenCV/TensorFlow model
    // For demonstration, we'll return a mock prediction

    await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate processing time

    const randomClass = model.classes[Math.floor(Math.random() * model.classes.length)]
    const randomConfidence = Math.random() * (1 - model.confidence_threshold) + model.confidence_threshold

    return {
      class: randomClass,
      confidence: Number.parseFloat(randomConfidence.toFixed(3)),
    }
  }

  private getImageFormat(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "unknown"
  }

  private getSpeciesInfo(className: string) {
    // This would typically come from your plant species database
    const speciesDatabase: Record<string, any> = {
      "Rhizophora mangle": {
        scientific_name: "Rhizophora mangle",
        common_name: "Red Mangrove",
        family: "Rhizophoraceae",
        habitat: "Coastal wetlands, tidal zones",
        conservation_status: "Least Concern",
      },
      "Avicennia germinans": {
        scientific_name: "Avicennia germinans",
        common_name: "Black Mangrove",
        family: "Acanthaceae",
        habitat: "Salt marshes, coastal areas",
        conservation_status: "Least Concern",
      },
      // Add more species as needed
    }

    return (
      speciesDatabase[className] || {
        scientific_name: className,
        common_name: "Unknown",
        family: "Unknown",
        habitat: "Coastal environment",
      }
    )
  }

  public getModelStats(): any {
    return {
      active_model: this.config.activeModel,
      available_models: Object.keys(this.config.models).length,
      total_classes: this.getActiveModel().classes.length,
      confidence_threshold: this.getActiveModel().confidence_threshold,
    }
  }
}

// Singleton instance
export const modelService = new ModelService()
