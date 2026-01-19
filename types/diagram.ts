export interface DiagramData {
  id: string;
  name: string;
  xml: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  xml: string;
  category: "architecture" | "flowchart" | "uml" | "network" | "other";
}
