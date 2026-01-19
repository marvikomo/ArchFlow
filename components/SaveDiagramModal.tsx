"use client";

import { useState } from "react";

interface SaveDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export default function SaveDiagramModal({ isOpen, onClose, onSave }: SaveDiagramModalProps) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      setName("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Save Diagram</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="diagram-name" className="block text-sm font-medium text-gray-700 mb-2">
              Diagram Name
            </label>
            <input
              type="text"
              id="diagram-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Diagram"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
