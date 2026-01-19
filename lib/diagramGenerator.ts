import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const SYSTEM_PROMPT = `You are an expert at creating draw.io diagrams. Generate valid draw.io XML format based on user descriptions.

IMPORTANT RULES:
1. Generate ONLY the mxGraphModel XML structure
2. Use proper draw.io XML format with mxCell elements
3. Position elements logically with appropriate spacing
4. Use standard draw.io shapes and styles
5. Include proper connections between related elements
6. Return ONLY the XML, no explanations or markdown
7. CRITICAL: Escape all special XML characters in text values:
   - Use &amp; for &
   - Use &lt; for <
   - Use &gt; for >
   - Use &quot; for "
   - Use &apos; for '

Basic structure template:
<mxGraphModel dx="1422" dy="794">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <!-- Your elements here -->
  </root>
</mxGraphModel>

Common shapes:
- Rectangle: style="rounded=0;whiteSpace=wrap;html=1;"
- Rounded Rectangle: style="rounded=1;whiteSpace=wrap;html=1;"
- Ellipse: style="ellipse;whiteSpace=wrap;html=1;"
- Diamond: style="rhombus;whiteSpace=wrap;html=1;"
- Cylinder (Database): style="shape=cylinder3;whiteSpace=wrap;html=1;"
- Cloud: style="ellipse;shape=cloud;whiteSpace=wrap;html=1;"

Example element:
<mxCell id="2" value="Component Name" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>

Example connection:
<mxCell id="3" value="Label" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="2" target="4">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>`;

function sanitizeXML(xml: string): string {
  // Fix common XML issues in value attributes
  // This regex finds value="..." and escapes special characters within
  return xml.replace(/value="([^"]*)"/g, (_match, content) => {
    const sanitized = content
      .replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;')  // Escape unescaped &
      .replace(/</g, '&lt;')   // Escape <
      .replace(/>/g, '&gt;');  // Escape >
    return `value="${sanitized}"`;
  });
}

export async function generateDiagramXML(prompt: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT,
      prompt: `Create a draw.io diagram for: ${prompt}`,
      temperature: 0.7,
      maxTokens: 4000,
    });

    // Extract XML from the response
    let xml = text.trim();

    // Remove markdown code blocks if present
    xml = xml.replace(/```xml\n?/g, "").replace(/```\n?/g, "");

    // Sanitize XML to fix common issues
    xml = sanitizeXML(xml);

    // Ensure we have the mxGraphModel wrapper
    if (!xml.includes("<mxGraphModel")) {
      xml = `<mxGraphModel dx="1422" dy="794">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    ${xml}
  </root>
</mxGraphModel>`;
    }

    return xml;
  } catch (error) {
    console.error("Error generating diagram:", error);
    throw new Error("Failed to generate diagram with AI");
  }
}

export function createBasicDiagram(): string {
  return `<mxGraphModel dx="1422" dy="794">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="Start Here" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
      <mxGeometry x="340" y="200" width="120" height="60" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="Use AI to generate your diagram!" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
      <mxGeometry x="310" y="280" width="180" height="30" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`;
}
