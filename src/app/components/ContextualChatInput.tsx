"use client";

import { useState, useEffect, useRef } from "react";
import TextExtractionService from "../services/TextExtractionService";

interface ContextualChatInputProps {
  onSendMessage: (message: string, context?: string) => void;
}

export default function ContextualChatInput({
  onSendMessage,
}: ContextualChatInputProps) {
  const [input, setInput] = useState("");
  const [extractions, setExtractions] = useState<any[]>([]);
  const [selectedExtraction, setSelectedExtraction] = useState<number | null>(
    null
  );
  const [latestExtraction, setLatestExtraction] = useState<any>(null);
  const [autoUseLatest, setAutoUseLatest] = useState(true);

  const extractionService = useRef(TextExtractionService.getInstance());
  const extractionsRef = useRef<any[]>([]);

  // Get extractions from service and listen for updates
  useEffect(() => {
    const handleExtractionUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        extractions: any[];
        latestExtraction: any;
      }>;

      if (customEvent.detail) {
        setExtractions(customEvent.detail.extractions);
        extractionsRef.current = customEvent.detail.extractions;

        // Update latest extraction and auto-select if enabled
        if (customEvent.detail.latestExtraction) {
          setLatestExtraction(customEvent.detail.latestExtraction);

          // Auto-select latest extraction if setting is enabled
          if (autoUseLatest) {
            const newExtractions = customEvent.detail.extractions;
            setSelectedExtraction(newExtractions.length - 1);

            // Auto-fill input with the region text if empty
            if (!input.trim()) {
              const regionText = customEvent.detail.latestExtraction.regionText;
              const truncatedText = regionText.substring(0, 150);
              setInput(truncatedText);
            }
          }
        }
      }
    };

    // Initial load
    const loadExtractions = () => {
      const history = extractionService.current.getHistory();
      setExtractions(history);
      extractionsRef.current = history;

      // Select the latest extraction if available and auto-use is enabled
      if (history.length > 0 && autoUseLatest) {
        setSelectedExtraction(history.length - 1);
        setLatestExtraction(history[history.length - 1]);
      }
    };

    loadExtractions();

    // Listen for real-time updates from any tab
    window.addEventListener("extraction-updated", handleExtractionUpdate);

    return () => {
      window.removeEventListener("extraction-updated", handleExtractionUpdate);
    };
  }, [autoUseLatest, input]);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAutoUse = localStorage.getItem("auto-use-latest");
      if (savedAutoUse !== null) {
        setAutoUseLatest(savedAutoUse === "true");
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auto-use-latest", String(autoUseLatest));
    }
  }, [autoUseLatest]);

  const handleSendMessage = () => {
    if (input.trim()) {
      // If an extraction is selected, use it as context
      if (
        selectedExtraction !== null &&
        extractionsRef.current[selectedExtraction]
      ) {
        const extraction = extractionsRef.current[selectedExtraction];

        // Use the region text as query and screen text as context
        const enhancedMessage = input;
        const context = `Screen Context: ${extraction.entireScreen}\nPointed Region: ${extraction.regionText}`;

        onSendMessage(enhancedMessage, context);
      } else {
        // No extraction selected, just send the message
        onSendMessage(input);
      }

      setInput("");

      // Keep the same selection if auto-use latest is enabled
      if (!autoUseLatest) {
        setSelectedExtraction(null);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col rounded-lg shadow-md bg-white p-3 w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-700">
          Send Message with Screen Context
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Auto-use latest:</span>
          <button
            onClick={() => setAutoUseLatest(!autoUseLatest)}
            className={`px-2 py-1 rounded text-xs text-white ${
              autoUseLatest ? "bg-green-500" : "bg-gray-500"
            }`}
          >
            {autoUseLatest ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {extractions.length > 0 ? (
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Select Screen Context:{" "}
            {selectedExtraction !== null
              ? `(#${selectedExtraction + 1} selected)`
              : "(none selected)"}
          </label>
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded">
            {extractions.map((extraction, index) => (
              <div
                key={index}
                className={`p-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                  selectedExtraction === index
                    ? "bg-blue-100 border-l-4 border-blue-500"
                    : ""
                } ${
                  latestExtraction &&
                  extraction.timestamp === latestExtraction.timestamp
                    ? "border-r-4 border-green-400"
                    : ""
                }`}
                onClick={() => setSelectedExtraction(index)}
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">
                    {new Date(extraction.timestamp).toLocaleTimeString()}
                  </p>
                  {latestExtraction &&
                    extraction.timestamp === latestExtraction.timestamp && (
                      <span className="text-xs bg-green-500 text-white px-1 rounded">
                        Latest
                      </span>
                    )}
                </div>
                <p className="text-xs truncate">
                  <span className="font-bold">Query:</span>{" "}
                  {extraction.regionText.substring(0, 30)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-3">
          No screen extractions available. Capture screen text first.
        </p>
      )}

      <div className="flex flex-col space-y-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedExtraction !== null
              ? "Use extracted text as context..."
              : "Type your message..."
          }
          className={`p-3 rounded-lg border ${
            selectedExtraction !== null
              ? "border-blue-300 bg-blue-50"
              : "border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-none`}
        />

        <div className="flex justify-between">
          <button
            onClick={() => {
              setSelectedExtraction(null);
              setInput("");
            }}
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send{" "}
            {selectedExtraction !== null ? "with Context" : "without Context"}
          </button>
        </div>
      </div>
    </div>
  );
}
