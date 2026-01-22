/**
 * Extract only complete mxCell elements from partial/streaming XML.
 * This allows progressive rendering during streaming by ignoring incomplete trailing elements.
 * @param xml - The partial XML string (may contain incomplete trailing mxCell)
 * @returns XML string containing only complete mxCell elements
 */
export function extractCompleteMxCells(xml: string | undefined | null): string {
  if (!xml) return "";

  const completeCells: Array<{ index: number; text: string }> = [];

  // Match self-closing mxCell tags: <mxCell ... />
  // Also match mxCell with nested mxGeometry: <mxCell ...>...<mxGeometry .../></mxCell>
  const selfClosingPattern = /<mxCell\s+[^>]*\/>/g;
  const nestedPattern = /<mxCell\s+[^>]*>[\s\S]*?<\/mxCell>/g;

  // Find all self-closing mxCell elements
  let match: RegExpExecArray | null;
  while ((match = selfClosingPattern.exec(xml)) !== null) {
    completeCells.push({ index: match.index, text: match[0] });
  }

  // Find all mxCell elements with nested content (like mxGeometry)
  while ((match = nestedPattern.exec(xml)) !== null) {
    completeCells.push({ index: match.index, text: match[0] });
  }

  // Sort by position to maintain order
  completeCells.sort((a, b) => a.index - b.index);

  // Remove duplicates (a self-closing match might overlap with nested match)
  const seen = new Set<number>();
  const uniqueCells = completeCells.filter((cell) => {
    if (seen.has(cell.index)) return false;
    seen.add(cell.index);
    return true;
  });

  return uniqueCells.map((c) => c.text).join("\n");
}
