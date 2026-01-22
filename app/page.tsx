"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import DiagramEditor from "@/components/DiagramEditor";
import AIPromptPanel from "@/components/AIPromptPanel";
import { extractCompleteMxCells } from "@/lib/xmlExtractor";
import { wrapWithBaseStructure, sanitizeXML } from "@/lib/xmlWrapper";

export default function Home() {
  const [diagramXml, setDiagramXml] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingXml, setStreamingXml] = useState<string>("");
  const accumulatedXmlRef = useRef<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced update function for progressive rendering
  const debouncedUpdate = useCallback((fullXml: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Update diagram (skip heavy validation during streaming)
      setDiagramXml(fullXml);
      console.log("[Diagram updated - debounced]", fullXml.length, "chars");
    }, 150); // 150ms debounce
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setStreamingXml("");
    accumulatedXmlRef.current = "";

    try {
      const response = await fetch("/api/generate-diagram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate diagram");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";
      let lastRenderTime = Date.now();
      const RENDER_DEBOUNCE_MS = 150;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages (format: "data: {json}\n\n")
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data: ")) continue;

          try {
            const jsonStr = line.slice(6); // Remove "data: " prefix
            const data = JSON.parse(jsonStr);

            // Handle xml-delta events (streaming XML progressively)
            if (data.type === "xml-delta") {
              const xmlFragment = data.xml;
              accumulatedXmlRef.current = xmlFragment; // The backend accumulates, we just take latest
              
              setStreamingXml(accumulatedXmlRef.current);
              
              console.log("[XML delta]", xmlFragment.length, "chars");
              
              // Debounced progressive rendering
              const now = Date.now();
              if (now - lastRenderTime >= RENDER_DEBOUNCE_MS) {
                lastRenderTime = now;
                
                // Extract complete cells and render progressively
                const completeCells = extractCompleteMxCells(xmlFragment);
                if (completeCells && completeCells.length > 0) {
                  const sanitized = sanitizeXML(completeCells);
                  const fullXml = wrapWithBaseStructure(sanitized);
                  
                  console.log("[Progressive render]", completeCells.length, "chars");
                  setDiagramXml(fullXml);
                }
              }
            }

            // Handle finish
            if (data.type === "finish") {
              console.log("[Stream finished]");
              
              // Final render with any remaining XML
              if (accumulatedXmlRef.current) {
                const completeCells = extractCompleteMxCells(accumulatedXmlRef.current);
                if (completeCells && completeCells.length > 0) {
                  const sanitized = sanitizeXML(completeCells);
                  const fullXml = wrapWithBaseStructure(sanitized);
                  setDiagramXml(fullXml);
                }
              }
              setStreamingXml("");
            }

            // Handle errors
            if (data.type === "error") {
              console.error("Stream error:", data);
              throw new Error(data.error || "Stream error");
            }
          } catch (parseError) {
            console.warn("Failed to parse line:", line.substring(0, 100), parseError);
          }
        }
      }
    } catch (error) {
      console.error("Error generating diagram:", error);
      alert("Failed to generate diagram. Please try again.");
    } finally {
      setIsGenerating(false);
      setStreamingXml("");
    }
  };

  const handleDiagramChange = (xml: string) => {
    setDiagramXml(xml);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <AIPromptPanel
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        streamingXml={streamingXml}
      />
      <DiagramEditor
        xml={diagramXml}
        onChange={handleDiagramChange}
      />
    </div>
  );
}
