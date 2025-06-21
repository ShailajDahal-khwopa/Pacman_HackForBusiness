"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Search } from "lucide-react"

export function CompetitionForm() {
  const [keyword, setKeyword] = useState("")
  const [results, setResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!keyword.trim()) {
      setError("Please enter a keyword")
      return
    }

    setIsLoading(true)
    setError("")
    setResults([])

    try {
      const response = await fetch("/api/competition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: keyword.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch competitions")
      }

      const data = await response.json()
      setResults(data.competitions || [])
    } catch (err) {
      setError("Failed to search competitions. Please try again.")
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Competitions</CardTitle>
          <CardDescription>Enter a keyword to find relevant competitions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyword">Keyword</Label>
              <div className="flex space-x-2">
                <Input
                  id="keyword"
                  type="text"
                  placeholder="Enter keyword (e.g., sales, marketing, tech)"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competition Results</CardTitle>
            <CardDescription>
              Found {results.length} competitions for "{keyword}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((competition, index) => (
                <div key={index} className="p-3 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <p className="text-sm font-medium">{competition}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
