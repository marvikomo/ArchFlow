"use client";

import { useState } from "react";
import DiagramEditor from "@/components/DiagramEditor";
import AIPromptPanel from "@/components/AIPromptPanel";

export default function Home() {
  const [diagramXml, setDiagramXml] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
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

      const data = await response.json();
      setDiagramXml(data.xml);
    } catch (error) {
      console.error("Error generating diagram:", error);
      alert("Failed to generate diagram. Please try again.");
    } finally {
      setIsGenerating(false);
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
      />
      <DiagramEditor
        xml={diagramXml}
        onChange={handleDiagramChange}
      />
    </div>
  );
}
