"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Remove useToast import
// import { useToast } from "@/hooks/use-toast"
import { Trophy, Upload, Search, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
// Import Sonner toast
import { toast } from "sonner"

interface CompetitionResult {
  match_percentage: number
  confidence: string
  details: {
    color_match: number
    shape_similarity: number
    texture_analysis: number
  }
  recommendations: string[]
}

export default function CompetitionPage() {
  const [keyword, setKeyword] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CompetitionResult | null>(null)
  // Remove useToast hook
  // const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!keyword || !selectedImage) {
      toast.error("Please provide both keyword and image", {
        description: "Error",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("keyword", keyword)
      formData.append("image", selectedImage)

      const response = await fetch("http://localhost:5000/match", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        toast.success("Competition analysis completed!", {
          description: "Success",
        })
      } else {
        throw new Error("Failed to analyze competition")
      }
    } catch (error) {
      // Simulate a response for demo purposes
      const mockResult: CompetitionResult = {
        match_percentage: 87.5,
        confidence: "high",
        details: {
          color_match: 92,
          shape_similarity: 85,
          texture_analysis: 86,
        },
        recommendations: [
          "Consider adjusting product positioning for better market appeal",
          "Enhance color scheme to match trending preferences",
          "Optimize product description with relevant keywords",
        ],
      }
      setResult(mockResult)
      toast("Demo Mode", {
        description: "Showing mock results (localhost:5000 not available)",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence.toLowerCase()) {
      case "high":
        return "default"
      case "medium":
        return "secondary"
      case "low":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Competition Analysis
        </h1>
        <p className="text-gray-600 mt-2">Analyze your products against market competition using AI-powered matching</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Submit for Analysis</span>
            </CardTitle>
            <CardDescription>Upload a product image and keyword to analyze market competition</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="keyword">Product Keyword</Label>
                <Input
                  id="keyword"
                  type="text"
                  placeholder="Enter product keyword (e.g., 'smartphone', 'laptop')"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="max-w-full h-48 object-contain mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedImage(null)
                          setImagePreview(null)
                        }}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        required
                      />
                      <Button type="button" variant="outline" onClick={() => document.getElementById("image")?.click()}>
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Analyze Competition
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Analysis Results</span>
            </CardTitle>
            <CardDescription>Competition analysis results will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{result.match_percentage}%</div>
                  <p className="text-gray-600">Market Match Score</p>
                  <Badge variant={getConfidenceColor(result.confidence)} className="mt-2">
                    {result.confidence.toUpperCase()} Confidence
                  </Badge>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Detailed Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Color Match</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${result.details.color_match}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{result.details.color_match}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Shape Similarity</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${result.details.shape_similarity}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{result.details.shape_similarity}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Texture Analysis</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${result.details.texture_analysis}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{result.details.texture_analysis}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Recommendations</h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Yet</h3>
                <p className="text-gray-500">Submit a product image and keyword to see competition analysis results.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
