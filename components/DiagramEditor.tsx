"use client";

import { useState } from "react";
import { DrawIoEmbed } from "react-drawio";
import SaveDiagramModal from "./SaveDiagramModal";
import DiagramLibrary from "./DiagramLibrary";
import { saveDiagram, exportDiagramAsFile } from "@/lib/storage";

interface DiagramEditorProps {
  xml: string;
  onChange: (xml: string) => void;
}

export default function DiagramEditor({ xml, onChange }: DiagramEditorProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleSave = (data: any) => {
    const xmlData = typeof data === 'string' ? data : data.xml || '';
    onChange(xmlData);
  };

  const handleSaveToLibrary = (name: string) => {
    saveDiagram({ name, xml });
    setShowSaveModal(false);
    alert("Diagram saved successfully!");
  };

  const handleExport = () => {
    if (xml) {
      exportDiagramAsFile(xml);
    }
  };

  const handleLoadFromLibrary = (loadedXml: string) => {
    onChange(loadedXml);
  };

  return (
    <>
      <div className="flex-1 flex flex-col h-full relative">
        <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
          <h1 className="text-xl font-semibold">DiagramAI Editor</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLibrary(true)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
            >
              My Diagrams
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={!xml}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              onClick={handleExport}
              disabled={!xml}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Export
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <DrawIoEmbed
            xml={xml}
            onSave={handleSave}
          />
        </div>
      </div>

      <SaveDiagramModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveToLibrary}
      />

      <DiagramLibrary
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onLoad={handleLoadFromLibrary}
      />
    </>
  );
}
