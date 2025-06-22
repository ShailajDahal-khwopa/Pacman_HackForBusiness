"use client"

import type React from "react"
import { useState } from "react"

interface CompetitionResult {
  status: string
  match_score?: number
  analysis?: string
  recommendations?: string[]
}

const showToast = (message: string, type: "success" | "error") => {
  const container = document.getElementById("toast-container")
  if (!container) return

  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.textContent = message

  container.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 3000)
}

export default function CompetitionPage() {
  const [keyword, setKeyword] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CompetitionResult | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!keyword || !image) {
      showToast("Please provide both keyword and image", "error")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("keyword", keyword)
      formData.append("image", image)

      const response = await fetch("http://localhost:5000/match", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        showToast("Competition analysis completed!", "success")
      } else {
        showToast("Failed to analyze competition", "error")
      }
    } catch (error) {
      showToast("Failed to connect to competition service", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
          Competition Analysis
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Analyze your competition with colorful keyword and image matching</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Submit Form */}
        <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-0 shadow-xl">
          <div className="card-header">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              Submit for Analysis
            </h2>
            <p className="text-gray-600">Upload an image and keyword to analyze your competition</p>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keyword</label>
                <input
                  className="input"
                  placeholder="Enter competition keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <p className="mb-2 text-sm text-gray-700 font-medium">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 10MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
                  </label>
                </div>
                {image && <p className="text-sm text-green-600 mt-2 font-medium">✓ Selected: {image.name}</p>}
              </div>

              <button type="submit" className="btn btn-primary w-full text-lg py-3" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Analyzing Competition...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Analyze Competition
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Display */}
        <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-xl">
          <div className="card-header">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Analysis Results
            </h2>
            <p className="text-gray-600">Competition analysis results will appear here</p>
          </div>
          <div className="card-content">
            {result ? (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200">
                  <h3 className="font-bold text-lg text-green-800 mb-2">Status: {result.status}</h3>
                </div>

                {result.match_score && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200">
                    <label className="block text-sm font-medium text-blue-800 mb-2">Match Score</label>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold text-blue-600">{result.match_score}%</div>
                      <div className="flex-1 bg-blue-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${result.match_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {result.analysis && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200">
                    <label className="block text-sm font-medium text-purple-800 mb-2">Analysis</label>
                    <textarea
                      value={result.analysis}
                      readOnly
                      className="w-full p-3 border border-purple-300 rounded-lg bg-white text-gray-700 resize-none"
                      rows={4}
                    />
                  </div>
                )}

                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200">
                    <label className="block text-sm font-medium text-orange-800 mb-3">Recommendations</label>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3 p-2 bg-white rounded-lg shadow-sm">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white mx-auto w-20 h-20 flex items-center justify-center mb-6">
                  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready for Analysis</h3>
                <p className="text-gray-500">Submit your keyword and image to see colorful analysis results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
