import { NextRequest, NextResponse } from "next/server";
import { generateDiagramXML } from "@/lib/diagramGenerator";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid prompt provided" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env file" },
        { status: 500 }
      );
    }

    const xml = await generateDiagramXML(prompt);

    return NextResponse.json({ xml });
  } catch (error) {
    console.error("Error in generate-diagram API:", error);
    return NextResponse.json(
      { error: "Failed to generate diagram. Please try again." },
      { status: 500 }
    );
  }
}
