"use client";

import { useState, useRef, useEffect } from "react";

interface AIPromptPanelProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  streamingXml?: string;
}

const examplePrompts = [
  "Create a microservices architecture diagram with API Gateway, Auth Service, User Service, and Database",
  "Design a CI/CD pipeline flowchart with GitHub, Jenkins, Docker, and Kubernetes",
  "Generate a UML class diagram for an e-commerce system with User, Product, Order, and Payment classes",
  "Create a network architecture diagram with firewall, load balancer, web servers, and database cluster",
  "Design a data flow diagram for a social media application",
];

export default function AIPromptPanel({ onGenerate, isGenerating, streamingXml }: AIPromptPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-scroll preview to bottom as content streams
  useEffect(() => {
    if (previewRef.current && streamingXml) {
      previewRef.current.scrollTop = previewRef.current.scrollHeight;
    }
  }, [streamingXml]);

  // Show preview when streaming starts, hide when done
  useEffect(() => {
    if (streamingXml && streamingXml.length > 0) {
      setShowPreview(true);
    } else if (!isGenerating && showPreview) {
      // Fade out preview after generation completes
      const timer = setTimeout(() => setShowPreview(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [streamingXml, isGenerating, showPreview]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="w-96 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
        <h2 className="text-2xl font-bold">DiagramAI</h2>
        <p className="text-sm text-blue-100 mt-1">AI-Powered Diagram Generation</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="mb-6">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Describe your diagram
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Create a system architecture diagram with frontend, backend API, and database..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Diagram"
            )}
          </button>
        </form>

        {/* Streaming Preview Panel */}
        {showPreview && (
          <div className="mb-6 border border-blue-200 rounded-lg bg-blue-50 overflow-hidden">
            <div className="bg-blue-100 px-3 py-2 border-b border-blue-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-blue-700">
                  {isGenerating ? "Streaming XML..." : "Generation Complete"}
                </span>
              </div>
              <span className="text-xs text-blue-600">
                {streamingXml?.length || 0} chars
              </span>
            </div>
            <div 
              ref={previewRef}
              className="p-3 max-h-48 overflow-y-auto bg-white font-mono text-xs text-gray-700 whitespace-pre-wrap break-all"
            >
              {streamingXml || "Waiting for data..."}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Example Prompts</h3>
          <div className="space-y-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                disabled={isGenerating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Tips</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Be specific about components and their relationships</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Mention the type of diagram you want (flowchart, UML, architecture, etc.)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>You can edit the generated diagram after creation</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Watch the XML stream in real-time as the AI generates your diagram</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
