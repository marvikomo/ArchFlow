/**
 * Wrap mxCell elements with the base mxGraphModel structure required by draw.io
 * @param mxCells - String containing mxCell elements
 * @returns Complete draw.io XML with wrapper structure
 */
export function wrapWithBaseStructure(mxCells: string): string {
  if (!mxCells || mxCells.trim() === "") {
    return `<mxGraphModel dx="1422" dy="794">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
  </root>
</mxGraphModel>`;
  }

  return `<mxGraphModel dx="1422" dy="794">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    ${mxCells}
  </root>
</mxGraphModel>`;
}

/**
 * Sanitize XML to escape special characters in value attributes
 * @param xml - Raw XML string
 * @returns Sanitized XML with escaped special characters
 */
export function sanitizeXML(xml: string): string {
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
