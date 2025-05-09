"use client";

import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";
import TextExtractionService, {
  TEXT_EXTRACTION_EVENT,
} from "../services/TextExtractionService";

interface ExtractedText {
  entireScreen: string;
  regionText: string;
  mousePosition: { x: number; y: number };
  timestamp: string;
}

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [extractions, setExtractions] = useState<ExtractedText[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [processingOCR, setProcessingOCR] = useState(false);
  const [extractionKey, setExtractionKey] = useState<string>("t");
  const [globalMode, setGlobalMode] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [liveVideoStream, setLiveVideoStream] = useState<MediaStream | null>(
    null
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const minimizedVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const extractionService = useRef(TextExtractionService.getInstance());

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("extraction-key");
      if (savedKey) setExtractionKey(savedKey);

      const savedGlobalMode = localStorage.getItem("global-mode");
      if (savedGlobalMode) setGlobalMode(savedGlobalMode === "true");

      const savedMinimized = localStorage.getItem("minimized-recorder");
      if (savedMinimized) setMinimized(savedMinimized === "true");
    }
  }, []);

  // Connect live video stream to video elements
  useEffect(() => {
    if (liveVideoStream) {
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = liveVideoStream;
      }
      if (minimizedVideoRef.current) {
        minimizedVideoRef.current.srcObject = liveVideoStream;
      }
    }
  }, [liveVideoStream]);

  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("extraction-key", extractionKey);
      localStorage.setItem("global-mode", String(globalMode));
      localStorage.setItem("minimized-recorder", String(minimized));
    }
  }, [extractionKey, globalMode, minimized]);

  // Track mouse position globally
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Update extraction history when component mounts or extraction-updated event fires
  useEffect(() => {
    const updateExtractions = () => {
      setExtractions(extractionService.current.getHistory());
    };

    // Load initial extractions
    updateExtractions();

    // Listen for updates from other tabs/windows
    window.addEventListener("extraction-updated", updateExtractions);

    return () => {
      window.removeEventListener("extraction-updated", updateExtractions);
    };
  }, []);

  // Listen for system-wide key events even when tab is not focused
  useEffect(() => {
    // Use the existing service worker for global events instead of creating a new one
    if (
      globalMode &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      const notifyServiceWorker = async () => {
        try {
          // Check if service worker is active
          const registration = await navigator.serviceWorker.ready;

          if (registration && registration.active) {
            // Tell the service worker to start monitoring with the current extraction key
            registration.active.postMessage({
              type: "START_MONITORING",
              extractionKey: extractionKey,
            });

            console.log("Notified service worker to enable global monitoring");
          }
        } catch (error) {
          console.error("Failed to communicate with service worker:", error);
        }
      };

      // Notify service worker when global mode is enabled
      if (globalMode) {
        notifyServiceWorker();
      }
    }
  }, [globalMode, extractionKey]);

  // Global key event handling
  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      // Only process if in global mode or if this tab/window is focused
      const isThisWindowFocused = document.hasFocus();
      const shouldProcessEvent = isThisWindowFocused || globalMode;

      if (!shouldProcessEvent) return;

      // Start streaming on 'Shift+S' key press
      if (event.key.toLowerCase() === "s" && event.shiftKey && !isRecording) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: { ideal: 30 } },
            audio: true,
          });

          streamRef.current = stream;
          setIsRecording(true);
          setLiveVideoStream(stream);
        } catch (error) {
          console.error("Error starting screen sharing:", error);
        }
      }
      // Stop streaming on 'Shift+Escape' key press
      else if (event.key === "Escape" && event.shiftKey && isRecording) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          setLiveVideoStream(null);
          streamRef.current = null;
          setIsRecording(false);
        }
      }
      // Capture and extract text when Shift+extraction key is pressed while recording
      else if (
        event.key.toLowerCase() === extractionKey.toLowerCase() &&
        event.shiftKey &&
        isRecording &&
        streamRef.current &&
        !processingOCR
      ) {
        await captureAndExtractText();
      }
      // Change extraction key to whatever key was pressed when pressing 'Shift+K' (key change)
      else if (
        event.key.toLowerCase() === "k" &&
        event.shiftKey &&
        !processingOCR
      ) {
        const newKey = prompt(
          "Enter a new key for text extraction:",
          extractionKey
        );
        if (newKey && newKey.length === 1) {
          setExtractionKey(newKey);
          localStorage.setItem("extraction-key", newKey);
        }
      }
      // Toggle global mode with Shift+G key
      else if (
        event.key.toLowerCase() === "g" &&
        event.shiftKey &&
        !processingOCR &&
        !isRecording
      ) {
        setGlobalMode(!globalMode);
      }
    };

    // Add only one event listener, not both
    document.addEventListener("keydown", handleKeyPress);

    // Set up focus monitoring
    const handleVisibilityChange = () => {
      if (globalMode && isRecording && document.visibilityState === "visible") {
        console.log("Window regained focus, extraction will continue working");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRecording, processingOCR, mousePosition, extractionKey, globalMode]);

  const captureAndExtractText = async () => {
    try {
      setProcessingOCR(true);
      if (!canvasRef.current || !streamRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx || !video) return;

      // Set canvas dimensions to match video/screen
      const track = streamRef.current.getVideoTracks()[0];
      const settings = track.getSettings();
      canvas.width = settings.width || window.innerWidth;
      canvas.height = settings.height || window.innerHeight;

      // Create a video element and load the stream
      video.srcObject = streamRef.current;
      await video.play();

      // Draw the current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get the full screenshot as data URL
      const fullScreenImage = canvas.toDataURL("image/png");

      // Extract text from the entire screen
      const fullScreenResult = await Tesseract.recognize(
        fullScreenImage,
        "eng"
      );
      const entireScreenText = fullScreenResult.data.text;

      // Extract text from the region around mouse pointer
      // Define the region (a 300x300 box around the mouse cursor)
      const regionSize = 300;
      const regionX = Math.max(0, mousePosition.x - regionSize / 2);
      const regionY = Math.max(0, mousePosition.y - regionSize / 2);

      // Draw a rectangle around the region (for visualization)
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.strokeRect(regionX, regionY, regionSize, regionSize);

      // Extract the region as a new canvas
      const regionCanvas = document.createElement("canvas");
      regionCanvas.width = regionSize;
      regionCanvas.height = regionSize;
      const regionCtx = regionCanvas.getContext("2d");

      if (!regionCtx) return;

      // Draw the region to the new canvas
      regionCtx.drawImage(
        canvas,
        regionX,
        regionY,
        regionSize,
        regionSize,
        0,
        0,
        regionSize,
        regionSize
      );

      // Get region image as data URL
      const regionImage = regionCanvas.toDataURL("image/png");

      // Extract text from region
      const regionResult = await Tesseract.recognize(regionImage, "eng");
      const regionText = regionResult.data.text;

      // Store the extracted text with metadata
      const extraction: ExtractedText = {
        entireScreen: entireScreenText,
        regionText: regionText,
        mousePosition: { ...mousePosition },
        timestamp: new Date().toISOString(),
      };

      // Add to service and update local state (this will trigger cross-tab sync)
      extractionService.current.addExtraction(extraction);
      setExtractions(extractionService.current.getHistory());

      // Also dispatch a global event for other tabs
      if (typeof window !== "undefined") {
        const extractionEvent = new CustomEvent(TEXT_EXTRACTION_EVENT, {
          detail: extraction,
        });
        window.dispatchEvent(extractionEvent);
      }
    } catch (error) {
      console.error("Error during OCR processing:", error);
    } finally {
      setProcessingOCR(false);
    }
  };

  return (
    <>
      {/* Main recorder UI */}
      {!minimized && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
          <div className="text-center">
            {isRecording ? (
              <div className="flex flex-col items-center space-y-2 w-full">
                {liveVideoStream && (
                  <div className="relative w-full max-w-3xl mb-4 bg-black rounded-lg overflow-hidden">
                    <video
                      ref={liveVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full"
                      style={{
                        maxHeight: "60vh",
                        objectFit: "contain",
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )}
                <p className="text-gray-600">
                  Sharing screen... (Press Shift+ESC to stop, Shift+
                  {extractionKey.toUpperCase()} to extract text)
                </p>
                {processingOCR && (
                  <div className="mt-2 text-blue-500">Processing OCR...</div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <p className="text-gray-600">
                  Press Shift+S to share your screen
                </p>
                <p className="text-sm text-gray-400">
                  When sharing, press Shift+{extractionKey.toUpperCase()} to
                  extract text at mouse position
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  (Press Shift+K to change extraction key, Shift+G to toggle
                  global mode)
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm">Global Mode:</span>
                  <button
                    onClick={() => setGlobalMode(!globalMode)}
                    className={`px-2 py-1 rounded text-white text-sm ${
                      globalMode ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    {globalMode ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {extractions.length > 0 && (
            <div className="mt-4 w-full max-h-40 overflow-y-auto border border-gray-200 rounded p-2 text-sm">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold">Text Extractions:</h3>
                <button
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  onClick={() => {
                    extractionService.current.clearHistory();
                    setExtractions([]);
                  }}
                >
                  Clear
                </button>
              </div>
              {extractions.map((ext, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-100 rounded">
                  <p>
                    <strong>Query (text at mouse):</strong>{" "}
                    {ext.regionText.substring(0, 50)}
                    {ext.regionText.length > 50 ? "..." : ""}
                  </p>
                  <p>
                    <strong>Context (screen):</strong>{" "}
                    {ext.entireScreen.substring(0, 50)}
                    {ext.entireScreen.length > 50 ? "..." : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    At position: {ext.mousePosition.x}, {ext.mousePosition.y}
                  </p>
                </div>
              ))}
            </div>
          )}

          <button
            className="mt-4 bg-gray-500 text-white py-1 px-3 rounded hover:bg-gray-600 transition-colors text-sm"
            onClick={() => setMinimized(true)}
          >
            Minimize
          </button>
        </div>
      )}

      {/* Floating minimized UI */}
      {minimized && (
        <div
          className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-50 border border-gray-200"
          style={{ minWidth: "180px" }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm">Screen Recorder</h3>
            <button
              className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
              onClick={() => setMinimized(false)}
            >
              Expand
            </button>
          </div>

          <div className="flex flex-col space-y-2">
            {liveVideoStream && isRecording && (
              <div className="relative w-full h-20 bg-black rounded-lg mb-2 overflow-hidden">
                <video
                  ref={minimizedVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  isRecording ? "bg-red-500 animate-pulse" : "bg-gray-300"
                }`}
              ></span>
              <span className="text-xs">
                {isRecording ? "Sharing Screen" : "Not Sharing"}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs">
                Extract Key: Shift+{extractionKey.toUpperCase()}
              </span>
              <button
                className="text-xs bg-blue-500 text-white px-1 rounded"
                onClick={() => {
                  const newKey = prompt(
                    "Enter a new key for text extraction:",
                    extractionKey
                  );
                  if (newKey && newKey.length === 1) {
                    setExtractionKey(newKey);
                    localStorage.setItem("extraction-key", newKey);
                  }
                }}
              >
                Change
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs">Global: </span>
              <button
                className={`text-xs px-2 rounded text-white ${
                  globalMode ? "bg-green-500" : "bg-gray-400"
                }`}
                onClick={() => setGlobalMode(!globalMode)}
              >
                {globalMode ? "ON" : "OFF"}
              </button>
            </div>

            {processingOCR && (
              <div className="text-xs text-blue-500">Processing OCR...</div>
            )}

            <div className="text-xs text-gray-500">
              Extractions: {extractions.length}
            </div>
          </div>
        </div>
      )}

      {/* Hidden elements for processing */}
      <video ref={videoRef} style={{ display: "none" }} muted />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
}
