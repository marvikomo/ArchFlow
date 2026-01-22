import { NextRequest } from "next/server";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { error: "Invalid prompt provided" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your .env file" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a diagram generation expert. Generate draw.io (diagrams.net) compatible XML diagrams.

CRITICAL: Output ONLY the raw mxCell XML elements directly in your response. Do NOT wrap in markdown, code blocks, or explanations. Start immediately with the first <mxCell tag.

Draw.io XML Structure:
- Each element is an mxCell with a unique id (start from 2)
- Use parent="1" for all diagram elements (shapes, connectors)
- Root cells (id 0 and 1) are added automatically - DO NOT include them

Shape Syntax:
<mxCell id="2" value="Label Text" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="100" y="50" width="120" height="60" as="geometry"/>
</mxCell>

Connector Syntax:
<mxCell id="3" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="2" target="4">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>

Special Characters in Labels:
- Use &lt; for <
- Use &gt; for >
- Use &quot; for "
- Use &apos; for '
- Use &amp; for &

Common styles:
- Rectangle: style="rounded=0;whiteSpace=wrap;html=1;"
- Rounded Rectangle: style="rounded=1;whiteSpace=wrap;html=1;"
- Ellipse: style="ellipse;whiteSpace=wrap;html=1;"
- Diamond: style="rhombus;whiteSpace=wrap;html=1;"
- Cylinder (Database): style="shape=cylinder3;whiteSpace=wrap;html=1;"

Position elements with 150-200px spacing.

OUTPUT ONLY XML - No explanations, no markdown, no code blocks.`;

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      prompt: `Create a draw.io diagram for: ${prompt}`,
      temperature: 0.7,
      maxTokens: 4000,
    });

    // Stream text chunks directly
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let accumulatedText = "";
        let chunkCount = 0;
        
        try {
          for await (const chunk of result.textStream) {
            accumulatedText += chunk;
            chunkCount++;
            
            console.log(`[Chunk ${chunkCount}] Delta: ${chunk.length} chars, Total: ${accumulatedText.length} chars`);
            
            // Send accumulated text as xml-delta event
            const event = {
              type: "xml-delta",
              xml: accumulatedText,
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          }
          
          console.log(`[Stream complete] Total chunks: ${chunkCount}, Final length: ${accumulatedText.length}`);
          
          // Send finish event
          const finishEvent = {
            type: "finish",
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finishEvent)}\n\n`));
          
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          const errorEvent = {
            type: "error",
            error: error instanceof Error ? error.message : "Stream error",
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Error in generate-diagram API:", error);
    return Response.json(
      { error: "Failed to generate diagram. Please try again." },
      { status: 500 }
    );
  }
}
