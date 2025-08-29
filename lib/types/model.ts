export interface ModelConfig {
  activeModel: string
  models: Record<string, ModelDefinition>
  fallback_model: string
  enable_ensemble: boolean
  logging: LoggingConfig
}

export interface ModelDefinition {
  name: string
  type: "opencv" | "tensorflow" | "pytorch" | "custom"
  version: string
  description: string
  modelPath: string
  confidence_threshold: number
  supported_formats: string[]
  max_image_size: number
  preprocessing: PreprocessingConfig
  classes: string[]
}

export interface PreprocessingConfig {
  resize: [number, number]
  normalize: boolean
  augmentation: boolean
}

export interface LoggingConfig {
  level: "debug" | "info" | "warn" | "error"
  log_predictions: boolean
  log_errors: boolean
}

export interface PredictionResult {
  class: string
  confidence: number
  species_info?: {
    scientific_name: string
    common_name: string
    family: string
    habitat: string
    conservation_status?: string
  }
  processing_time: number
  model_used: string
  timestamp: string
}

export interface ModelError {
  error: string
  model: string
  timestamp: string
  image_info?: {
    size: number
    format: string
    dimensions: [number, number]
  }
}
