import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json()

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json({ error: "Keyword is required and must be a string" }, { status: 400 })
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock competition data based on keyword
    const mockCompetitions = generateMockCompetitions(keyword.toLowerCase())

    return NextResponse.json({
      success: true,
      keyword,
      competitions: mockCompetitions,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateMockCompetitions(keyword: string): string[] {
  const competitionTemplates = {
    sales: [
      "Q1 Sales Excellence Challenge",
      "Monthly Revenue Growth Competition",
      "Customer Acquisition Contest",
      "Sales Team Performance Battle",
      "Territory Expansion Challenge",
    ],
    marketing: [
      "Digital Marketing Innovation Contest",
      "Brand Awareness Campaign Challenge",
      "Social Media Engagement Competition",
      "Content Creation Championship",
      "Lead Generation Challenge",
    ],
    tech: [
      "Code Quality Competition",
      "Innovation Hackathon Challenge",
      "Bug Fixing Championship",
      "Performance Optimization Contest",
      "Tech Stack Mastery Challenge",
    ],
    default: [
      `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Excellence Award`,
      `Annual ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Championship`,
      `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Innovation Contest`,
      `Monthly ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Challenge`,
      `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Performance Competition`,
    ],
  }

  // Return competitions based on keyword, or default ones
  return competitionTemplates[keyword as keyof typeof competitionTemplates] || competitionTemplates.default
}
