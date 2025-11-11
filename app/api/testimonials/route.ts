import { NextResponse } from "next/server"

export async function GET() {
  const testimonials = [
    {
      id: "1",
      name: "Carlos M.",
      country: "Mexico",
      program: "Business Administration",
      quote: "Coming to Barcelona was the best decision of my life. As a gay man from Mexico, I never felt truly safe being myself. Here, I can hold my partner's hand in public without fear.",
      photo: "👨",
      approved: true,
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "Maria S.",
      country: "Colombia",
      program: "Gender Studies",
      quote: "Barcelona gave me the freedom to explore my identity as a non-binary person. The university has gender-neutral bathrooms and my professors use my pronouns.",
      photo: "🧑",
      approved: true,
      createdAt: "2024-02-20"
    },
    {
      id: "3",
      name: "Valentina R.",
      country: "Argentina",
      program: "Psychology",
      quote: "I was worried about discrimination as a trans woman, but Barcelona exceeded my expectations. The healthcare system supports trans people.",
      photo: "👩",
      approved: true,
      createdAt: "2024-03-10"
    }
  ]

  return NextResponse.json({ data: testimonials }, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400"
    }
  })
}
