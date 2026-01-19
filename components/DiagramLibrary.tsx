"use client";

import { useEffect, useState } from "react";
import { DiagramData } from "@/types/diagram";
import { getAllDiagrams, deleteDiagram } from "@/lib/storage";

interface DiagramLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (xml: string) => void;
}

export default function DiagramLibrary({ isOpen, onClose, onLoad }: DiagramLibraryProps) {
  const [diagrams, setDiagrams] = useState<DiagramData[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDiagrams(getAllDiagrams());
    }
  }, [isOpen]);

  const handleLoad = (xml: string) => {
    onLoad(xml);
    onClose();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this diagram?")) {
      deleteDiagram(id);
      setDiagrams(getAllDiagrams());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Diagrams</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {diagrams.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No saved diagrams yet</p>
              <p className="text-sm mt-2">Create and save diagrams to see them here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {diagrams.map((diagram) => (
                <div
                  key={diagram.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{diagram.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Updated {new Date(diagram.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleLoad(diagram.xml)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(diagram.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
