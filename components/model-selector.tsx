"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain } from "lucide-react"

interface ModelInfo {
  name: string
  type: string
  version: string
  description: string
  confidence_threshold: number
  classes: string[]
}

interface ModelStats {
  active_model: string
  available_models: number
  total_classes: number
  confidence_threshold: number
}

export function ModelSelector() {
  const [models, setModels] = useState<Record<string, ModelInfo>>({})
  const [stats, setStats] = useState<ModelStats | null>(null)
  const [activeModel, setActiveModel] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch("/api/models")
      const data = await response.json()
      setModels(data.models)
      setStats(data.stats)
      setActiveModel(data.active_model)
    } catch (error) {
      console.error("Failed to fetch models:", error)
    } finally {
      setLoading(false)
    }
  }

  const switchModel = async (modelKey: string) => {
    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelKey }),
      })

      if (response.ok) {
        setActiveModel(modelKey)
        await fetchModels() // Refresh stats
      }
    } catch (error) {
      console.error("Failed to switch model:", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading models...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Model Configuration
          </CardTitle>
          <CardDescription>Select and configure the AI model for plant identification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Active Model:</label>
            <Select value={activeModel} onValueChange={switchModel}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(models).map(([key, model]) => (
                  <SelectItem key={key} value={key}>
                    {model.name} v{model.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.available_models}</div>
                <div className="text-sm text-muted-foreground">Available Models</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{stats.total_classes}</div>
                <div className="text-sm text-muted-foreground">Plant Classes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{(stats.confidence_threshold * 100).toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Min Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{models[activeModel]?.type.toUpperCase()}</div>
                <div className="text-sm text-muted-foreground">Model Type</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {Object.entries(models).map(([key, model]) => (
          <Card key={key} className={activeModel === key ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={activeModel === key ? "default" : "secondary"}>
                    {activeModel === key ? "Active" : "Available"}
                  </Badge>
                  <Badge variant="outline">{model.type}</Badge>
                </div>
              </div>
              <CardDescription>{model.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Version:</span> {model.version}
                </div>
                <div>
                  <span className="font-medium">Confidence:</span> {(model.confidence_threshold * 100).toFixed(0)}%
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Supported Classes:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {model.classes.slice(0, 3).map((className) => (
                      <Badge key={className} variant="outline" className="text-xs">
                        {className}
                      </Badge>
                    ))}
                    {model.classes.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{model.classes.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
