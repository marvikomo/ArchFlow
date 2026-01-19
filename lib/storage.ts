import { DiagramData } from "@/types/diagram";

const STORAGE_KEY = "diagramai_diagrams";

export function saveDiagram(diagram: Omit<DiagramData, "id" | "createdAt" | "updatedAt">): DiagramData {
  const diagrams = getAllDiagrams();
  const now = new Date().toISOString();

  const newDiagram: DiagramData = {
    id: crypto.randomUUID(),
    ...diagram,
    createdAt: now,
    updatedAt: now,
  };

  diagrams.push(newDiagram);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(diagrams));

  return newDiagram;
}

export function updateDiagram(id: string, updates: Partial<Pick<DiagramData, "name" | "xml">>): DiagramData | null {
  const diagrams = getAllDiagrams();
  const index = diagrams.findIndex(d => d.id === id);

  if (index === -1) return null;

  diagrams[index] = {
    ...diagrams[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(diagrams));
  return diagrams[index];
}

export function getAllDiagrams(): DiagramData[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getDiagram(id: string): DiagramData | null {
  const diagrams = getAllDiagrams();
  return diagrams.find(d => d.id === id) || null;
}

export function deleteDiagram(id: string): boolean {
  const diagrams = getAllDiagrams();
  const filtered = diagrams.filter(d => d.id !== id);

  if (filtered.length === diagrams.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function exportDiagramAsFile(xml: string, filename: string = "diagram.drawio") {
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
