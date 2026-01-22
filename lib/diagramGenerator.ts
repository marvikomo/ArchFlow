import { wrapWithBaseStructure, sanitizeXML } from "./xmlWrapper";

// Legacy function kept for backwards compatibility
// The new streaming approach uses tools in the API route directly
export async function generateDiagramXML(prompt: string): Promise<string> {
  throw new Error("This function is deprecated. Use the streaming API endpoint instead.");
}

export function createBasicDiagram(): string {
  return wrapWithBaseStructure("");
}

// Re-export utilities for convenience
export { wrapWithBaseStructure, sanitizeXML };
